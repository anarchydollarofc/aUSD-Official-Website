from flask import Flask, redirect, url_for, session, request, jsonify
from requests_oauthlib import OAuth1Session
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env. ESSENCIAL, SEU ANIMAL!
load_dotenv() 

app = Flask(__name__)
# A chave secreta é essencial pra segurança das sessões Flask. Se não tiver, o app nem liga!
app.secret_key = os.getenv("FLASK_SECRET_KEY") 

print(f"DEBUG: FLASK_SECRET_KEY carregada: {app.secret_key}") # Linha de debug. Fica de olho!

# --- CONFIGURAÇÕES: PEGA ESSES VALORES LÁ NO SEU X DEVELOPER PORTAL, NÃO ESQUECE! ---
# Carregados das variáveis de ambiente com python-dotenv. SEGURANÇA MÁXIMA!
CONSUMER_KEY = os.getenv("X_CONSUMER_KEY") 
CONSUMER_SECRET = os.getenv("X_CONSUMER_SECRET")
# O URI de callback AGORA APONTA PARA SEU DOMÍNIO PÚBLICO NO RENDER!
# Essa URL TEM QUE BATER EXATAMENTE com o que você configurou no X Developer Portal, PORRA!
CALLBACK_URI = "https://ausd-backend-api.onrender.com/callback" 
# --- FIM DAS CONFIGURAÇÕES ---

print(f"DEBUG: CONSUMER_KEY carregada: {CONSUMER_KEY}") # Linha de debug. Vê se não é None!
print(f"DEBUG: CONSUMER_SECRET carregada: {CONSUMER_SECRET}") # Linha de debug. Vê se não é None!

# As URLs fudidas da API do X pro OAuth 1.0a
REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token"
AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize"
ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token"
VERIFY_CREDENTIALS_URL = "https://api.twitter.com/1.1/account/verify_credentials.json"

# Nosso "banco de dados" de fachada pra tokens de usuário. EM PRODUÇÃO, É DB DE VERDADE, SEU ANIMAL!
# Essa porra é só pra simular armazenamento em memória, ela some quando o servidor reinicia.
user_tokens = {} # Ex: {'user_id': {'oauth_token': '...', 'oauth_token_secret': '...'}}

@app.route('/')
def index():
    return "Backend para aUSD (Anarchy Dollar). Acesse /connect_x para iniciar a autenticação com o X."

@app.route('/connect_x')
def connect_x():
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        return jsonify({"error": "Credenciais da API do X (X_CONSUMER_KEY, X_CONSUMER_SECRET) não configuradas no .env. Que vacilo!"}), 500
    if not app.secret_key:
        return jsonify({"error": "FLASK_SECRET_KEY não configurada no .env. Seu app não vai rodar sem isso!"}), 500

    oauth = OAuth1Session(CONSUMER_KEY, client_secret=CONSUMER_SECRET,
                          callback_uri=CALLBACK_URI) # Usa o CALLBACK_URI do Render aqui, PORRA!
    
    # 1. Obter um request token
    try:
        fetch_response = oauth.fetch_request_token(REQUEST_TOKEN_URL)
    except Exception as e:
        # Erro comum aqui é 401 (chaves de API erradas ou configuração do app zoada)
        # Ou problemas de conexão com a API do X. Fique ligado!
        return jsonify({"error": f"Falha ao pegar request token do X: {str(e)}. Verifique suas credenciais no X Developer Portal e permissões do app."}), 500

    resource_owner_key = fetch_response.get('oauth_token')
    resource_owner_secret = fetch_response.get('oauth_token_secret')

    # SALVAR NA SESSÃO! ESSE É O PONTO CRÍTICO, PORRA!
    session['oauth_token'] = resource_owner_key
    session['oauth_token_secret'] = resource_owner_secret
    session.modified = True # Força a sessão a ser marcada como modificada. ISSO É VITAL!
    
    # Redireciona o usuário para o X para autorização. 
    # O requests_oauthlib.authorization_url() já adiciona o oauth_token necessário.
    authorization_url = oauth.authorization_url(AUTHORIZE_URL)
    
    print(f"Redirecionando para: {authorization_url}") # Pra você ver a porra acontecendo no terminal
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    print("\n--- DEBUG CALLBACK ROUTE ---")
    print(f"DEBUG: request.args: {request.args}") 
    # VAMOS VER AGORA SE A SESSÃO TEM CONTEÚDO ANTES DO POP. É A PROVA FINAL!
    print(f"DEBUG: session content before pop: {session.get('oauth_token')}, {session.get('oauth_token_secret')}")

    # PEGANDO DA SESSÃO
    resource_owner_key = session.pop('oauth_token', None)
    resource_owner_secret = session.pop('oauth_token_secret', None)
    
    print(f"DEBUG: resource_owner_key after pop: {resource_owner_key}")
    print(f"DEBUG: resource_owner_secret after pop: {resource_owner_secret}")

    # O requests_oauthlib requer que resource_owner_key seja o token ORIGINAL do request.
    # Se o X retornou um oauth_token na URL, ele é o request token.
    oauth_token_from_x_url = request.args.get('oauth_token')
    if oauth_token_from_x_url: # Se o token veio na URL do X, priorize-o
        resource_owner_key = oauth_token_from_x_url

    if not resource_owner_key or not resource_owner_secret:
        return jsonify({"error": "Faltando tokens de requisição OAuth cruciais na sessão do Flask ou no retorno do X. Verifique a FLASK_SECRET_KEY e os cookies do navegador. Provavelmente, o X não redirecionou o oauth_token original ou a sessão falhou."}), 400

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
        return jsonify({"error": f"Falha ao pegar access token do X: {str(e)}. Verifique as permissões do app no X Developer Portal."}), 500

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
        return jsonify({"error": "Usuário não conectado ao X ou token não encontrado. Que vacilo!"}), 404

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
        return jsonify({"error": f"Falha ao buscar perfil do X: {str(e)}. Vê o status da API do X ou a validade do token, seu animal!"}), 500

if __name__ == '__main__':
    if not CONSUMER_KEY or not CONSUMER_SECRET:
        print("ERRO CRÍTICO: Variáveis de ambiente X_CONSUMER_KEY ou X_CONSUMER_SECRET não estão definidas, SEU BURRO!")
        print("Certifique-se de que o arquivo .env existe e está na raiz do projeto, e contém as chaves válidas do X Developer Portal.")
        exit(1)
    
    if not app.secret_key:
        print("ERRO CRÍTICO: FLASK_SECRET_KEY não está definida.")
        print("Gere uma chave segura e adicione-a ao seu arquivo .env, seu cuzão!")
        exit(1)
        
    app.run(debug=True, port=5000)
