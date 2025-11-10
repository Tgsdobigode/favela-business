## Objetivo rápido
Este repositório é um app Expo (React Native) minimalista que usa Firebase (Auth + Firestore) e captura localização com `expo-location`. As instruções abaixo ajudam um agente AI a ser produtivo rapidamente e a respeitar as convenções locais.

## Visão geral da arquitetura
- Plataforma: Expo (React Native). Fluxo principal no `App.js` (stack navigation).
- Auth & dados: Firebase Authentication (email/senha) e Firestore. Configuração em `firebaseConfig.js`.
- Padrão de pastas (esperado): `src/screens`, `src/components`, `src/services`, `src/styles`, `assets`.
- Telas importantes (existem exemplos): `src/screens/LoginScreen.js`, `src/screens/RegisterScreen.js`, `src/screens/Dashboard.js`.

## Pontos críticos e exemplos concretos
- Fluxo de autenticação: Login usa `signInWithEmailAndPassword` e chama `navigation.replace('Dashboard')` (ver `src/screens/LoginScreen.js`).
- Registro: `createUserWithEmailAndPassword` + `setDoc(doc(db, 'usuarios', uid), { nome, descricao })` (ver `src/screens/RegisterScreen.js`).
- Localização: `expo-location` é solicitado no `App.js` com `Location.requestForegroundPermissionsAsync()` e `Location.getCurrentPositionAsync()` — lembrar de checar `status !== 'granted'`.
- Nomes de coleção/fields: coleção `usuarios`, campos `nome` e `descricao` (use estes nomes ao integrar com backend).

## Convenções e padrões do projeto
- Strings visuais e variáveis estão em português (ex.: `senha`, `descricao`, títulos das telas). Mantenha a linguagem consistente.
- Navegação: Stack Navigator com nomes de rota exatos: `Login`, `Registrar`, `Dashboard` — ao adicionar telas, registre-as no `Stack.Navigator` em `App.js`.
- Firebase: centralize lógica Firebase em `src/services/firebase.js` se for adicionar código — evitar duplicar `getAuth()`/`getFirestore()` direto nas telas.
- UI: telas exemplo usam estilos inline simples; refatore para `src/styles` quando adicionar componentes reutilizáveis.

## Fluxo de desenvolvimento (comandos detectados no repositório)
- Inicializar template Expo (quando for criar/replicar o projeto):
  - `npx create-expo-app@latest . --template blank`
- Instalar dependências principais: `npm install firebase expo-location react-native-maps`
- Iniciar dev server: `npx expo start` (ou `npm start` se `package.json` tiver script). Usar Expo Go / emulador.
- Pré-requisito Firebase: preencher `firebaseConfig.js` com as chaves do projeto e ativar Email/Password em Authentication e regras Firestore adequadas.

## O que evitar / checar automaticamente
- Não commitar chaves reais no `firebaseConfig.js`. Se necessário, use variáveis de ambiente / secrets — deixe o arquivo de exemplo com placeholders.
- Tratar o caso de permissão de localização negada (apenas `alert()` atualmente). Prefira um fallback amigável ao usuário em produção.

## Contrato curto para mudanças em telas de auth
- Entrada: `email`, `senha`, possivelmente `nome`/`descricao` nos formulários.
- Efeito: chama Firebase Auth; no sucesso cria/atualiza documento em `usuarios` com `uid` como id.
- Erro: usa `alert('Erro ...' + e.message)`; ao modificar, preserve mensagens claras em pt-BR.

## Casos de borda conhecidos
- `firebaseConfig.js` não preenchido → auth/firestore falhará. O agente deve detectar placeholders e avisar.
- Permissão de localização negada → funcionalidades dependentes de localização silenciam (apenas alert). Documente e proponha fallback.

## Referências rápidas de arquivos
- `app.js` — flow inicial / exemplo de criação de projeto (script de scaffolding presente no repo).
- `firebaseConfig.js` — arquivo que precisa ser preenchido com chaves do Firebase.
- `src/screens/*.js` — exemplos de telas que mostram padrões de autenticação e navegação.

Se algo ficou vago (por ex., scripts npm, uso de CI/CD, ou detalhes de build), me pergunte e eu ajusto o arquivo com instruções específicas. Quer que eu adicione um exemplo de `src/services/firebase.js` e testes rápidos para autenticação como próxima etapa?
