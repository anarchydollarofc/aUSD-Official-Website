from flask import Flask, redirect, url_for, session, request, jsonify
from requests_oauthlib import OAuth1Session
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv() 

app = Flask(__name__)
# A chave secreta é essencial para a segurança das sessões Flask
# Carregada do .env. Se não estiver definida, o app não rodará
app.secret_key = os.getenv("FLASK_SECRET_KEY") 

print(f"DEBUG: FLASK_SECRET_KEY carregada: {app.secret_key}") # Linha de debug

# --- CONFIGURAÇÕES: OBTENHA ESTES VALORES DO SEU X DEVELOPER PORTAL ---
# Carregados de variáveis de ambiente usando python-dotenv
CONSUMER_KEY = os.getenv("X_CONSUMER_KEY") 
CONSUMER_SECRET = os.getenv("X_CONSUMER_SECRET")
# O URI de callback DEVE CORRESPONDER ao que você configurou no X Developer Portal
# Para desenvolvimento local, use a porta que seu Flask vai rodar (ex: 5000)
# É altamente recomendável usar 127.0.0.1 em vez de localhost para evitar problemas de sessão/cookie em alguns navegadores
CALLBACK_URI = "http://127.0.0.1:5000/callback" 
# --- FIM DAS CONFIGURAÇÕES ---

print(f"DEBUG: CONSUMER_KEY carregada: {CONSUMER_KEY}") # Linha de debug
print(f"DEBUG: CONSUMER_SECRET carregada: {CONSUMER_SECRET}") # Linha de debug

# URLs da API do X para OAuth 1.0a
REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize"
ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"
VERIFY_CREDENTIALS_URL = "https://api.twitter.com/1.1/account/verify_credentials.json"

# Para simular o armazenamento de tokens de usuários (em produção, use um DB)
# Esta é uma simulação simples em memória e será perdida ao reiniciar o servidor
user_tokens = {} # Ex: {'user_id': {'oauth_token': '...', 'oauth_token_secret': '...'}}

@app.route('/')
def index():
    return "Backend para aUSD (Anarchy Dollar). Acesse /connect_x para iniciar a autenticação com o X."

@app.route('/connect_x')
def connect_x():
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        return jsonify({"error": "X API credentials (X_CONSUMER_KEY, X_CONSUMER_SECRET) not set in .env"}), 500
    if not app.secret_key:
        return jsonify({"error": "FLASK_SECRET_KEY not set in .env"}), 500

    oauth = OAuth1Session(CONSUMER_KEY, client_secret=CONSUMER_SECRET,
                          callback_uri=CALLBACK_URI)
    
    # 1. Obter um request token
    try:
        fetch_response = oauth.fetch_request_token(REQUEST_TOKEN_URL)
    except Exception as e:
        # Erro comum aqui é 401: Invalid or expired token (API keys erradas/app config)
        # Ou problemas de conexão com a API do X
        return jsonify({"error": f"Failed to get request token from X: {str(e)}"}), 500

    resource_owner_key = fetch_response.get('oauth_token')
    resource_owner_secret = fetch_response.get('oauth_token_secret')

    # ATENÇÃO: PASSANDO AMBOS OS TOKENS NA URL DO X COMO PARÂMETROS ADICIONAIS.
    # ISSO É UMA GAMBIARRA PARA DESENVOLVIMENTO LOCAL E PARA CONTORNAR PROBLEMAS DE SESSÃO.
    # O X geralmente ignora parâmetros extras na URL de autorização, mas esperamos que os repasse no callback.
    authorization_url = oauth.authorization_url(AUTHORIZE_URL)
    authorization_url_with_all_tokens = (
        f"{authorization_url}"
        f"&my_oauth_token={resource_owner_key}"  # Usando nomes personalizados para garantir que não conflita
        f"&my_oauth_token_secret={resource_owner_secret}"
    )
    
    print(f"Redirecionando para: {authorization_url_with_all_tokens}") # Para depuração no terminal
    return redirect(authorization_url_with_all_tokens)

@app.route('/callback')
def callback():
    print("\n--- DEBUG CALLBACK ROUTE ---")
    print(f"DEBUG: request.args: {request.args}") 
    print(f"DEBUG: session content before pop: {session.get('oauth_token')}, {session.get('oauth_token_secret')}")

    # ESTRATÉGIA DE RECUPERAÇÃO DE TOKENS:
    # 1. Tentar pegar os tokens customizados que adicionamos na URL (my_oauth_token, my_oauth_token_secret)
    resource_owner_key = request.args.get('my_oauth_token')
    resource_owner_secret = request.args.get('my_oauth_token_secret')

    # 2. Se não vierem nossos customizados, tentar pegar o oauth_token que o X sempre manda na URL
    # e o oauth_token_secret da sessão (como fallback final, já que a sessão tem sido um problema)
    oauth_token_from_x = request.args.get('oauth_token') # Este é o request token que o X retorna
    if not resource_owner_key and oauth_token_from_x:
        resource_owner_key = oauth_token_from_x
        # Tenta pegar o secret da sessão como último recurso se não veio no nosso parâmetro customizado
        if not resource_owner_secret:
            resource_owner_secret = session.pop('oauth_token_secret', None)

    # Garante que os tokens da sessão sejam removidos, caso ainda estejam lá
    session.pop('oauth_token', None)
    session.pop('oauth_token_secret', None)
    
    # AQUI GARANTIMOS QUE TEMOS AMBOS OS TOKENS NECESSÁRIOS
    print(f"DEBUG: Final resource_owner_key (from URL/session): {resource_owner_key}")
    print(f"DEBUG: Final resource_owner_secret (from URL/session): {resource_owner_secret}")
    
    if not resource_owner_key or not resource_owner_secret:
        return jsonify({"error": "Faltando tokens de requisição OAuth cruciais no retorno do X ou na sessão do Flask. A API do X pode não estar repassando os parâmetros extras."}), 400

    oauth_verifier = request.args.get('oauth_verifier')
    print(f"DEBUG: oauth_verifier: {oauth_verifier}")
    if not oauth_verifier:
        return jsonify({"error": "OAuth verifier not found in callback."}), 400
    
    print("--- FIM DEBUG CALLBACK ROUTE ---\n")

    oauth = OAuth1Session(CONSUMER_KEY,
                          client_secret=CONSUMER_SECRET,
                          resource_owner_key=resource_owner_key,
                          resource_owner_secret=resource_owner_secret,
                          verifier=oauth_verifier)

    try:
        oauth_tokens = oauth.fetch_access_token(ACCESS_TOKEN_URL)
    except Exception as e:
        return jsonify({"error": f"Failed to get access token from X: {str(e)}"}), 500

    access_token = oauth_tokens.get('oauth_token')
    access_token_secret = oauth_tokens.get('oauth_token_secret')
    user_x_id = oauth_tokens.get('user_id')
    screen_name = oauth_tokens.get('screen_name')

    user_tokens[user_x_id] = {
        'oauth_token': access_token,
        'oauth_token_secret': access_token_secret,
        'screen_name': screen_name
    }

    return redirect(url_for('x_connected', user_id=user_x_id, screen_name=screen_name))

@app.route('/x_connected')
def x_connected():
    user_id = request.args.get('user_id')
    screen_name = request.args.get('screen_name')
    if user_id and screen_name:
        return f"Conectado ao X com sucesso como @{screen_name}! User ID: {user_id}. Seu frontend pode usar esses dados para ativar o minerador!"
    return "Conectado ao X com sucesso, mas faltam dados no redirecionamento. Verifique o fluxo."

@app.route('/get_x_profile/<user_id>')
def get_x_profile(user_id):
    user_data = user_tokens.get(user_id)
    if not user_data:
        return jsonify({"error": "User not connected to X or token not found."}), 404

    oauth = OAuth1Session(CONSUMER_KEY,
                          client_secret=CONSUMER_SECRET,
                          resource_owner_key=user_data['oauth_token'],
                          resource_owner_secret=user_data['oauth_token_secret'])
    
    try:
        response = oauth.get(VERIFY_CREDENTIALS_URL, params={"include_entities": False, "skip_status": True})
        response.raise_for_status()
        profile_info = response.json()
        return jsonify({
            "id": profile_info.get("id_str"),
            "username": profile_info.get("screen_name"),
            "name": profile_info.get("name"),
            "profile_image_url": profile_info.get("profile_image_url_https")
        })
    except Exception as e:
        return jsonify({"error": f"Failed to fetch X profile: {str(e)}. Check X API status or token validity."}), 500

if __name__ == '__main__':
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        print("ERRO CRÍTICO: Variáveis de ambiente X_CONSUMER_KEY ou X_CONSUMER_SECRET não estão definidas.")
        print("Certifique-se de que o arquivo .env existe e está na raiz do projeto, e contém as chaves válidas do X Developer Portal.")
        exit(1)
    
    if not app.secret_key:
        print("ERRO CRÍTICO: FLASK_SECRET_KEY não está definida.")
        print("Gere uma chave segura e adicione-a ao seu arquivo .env.")
        exit(1)
        
    app.run(debug=True, port=5000)
