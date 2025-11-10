# 1️⃣ Criar pasta e entrar nela
mkdir favela-business && cd favela-business

# 2️⃣ Iniciar o projeto Expo
npx create-expo-app@latest . --template blank

# 3️⃣ Instalar dependências principais
npm install firebase expo-location react-native-maps

# 4️⃣ Criar estrutura de pastas
mkdir -p src/{screens,components,services,styles,assets}

# 5️⃣ Criar App.js base
cat > App.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import Dashboard from './src/screens/Dashboard';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import * as Location from 'expo-location';

const Stack = createStackNavigator();
initializeApp(firebaseConfig);

export default function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão de localização negada!');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registrar" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOF

# 6️⃣ Criar arquivo Firebase config
cat > firebaseConfig.js << 'EOF'
export const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
EOF

# 7️⃣ Criar telas base
cat > src/screens/LoginScreen.js << 'EOF'
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const login = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.replace('Dashboard');
    } catch (e) {
      alert('Erro ao logar: ' + e.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 10 }}>Favela Business</Text>
      <TextInput placeholder="E-mail" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Entrar" onPress={login} />
      <Button title="Registrar" onPress={() => navigation.navigate('Registrar')} />
    </View>
  );
}
EOF

cat > src/screens/RegisterScreen.js << 'EOF'
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const registrar = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        nome,
        descricao
      });
      navigation.replace('Dashboard');
    } catch (e) {
      alert('Erro ao registrar: ' + e.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 10 }}>Criar conta</Text>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="O que você sabe fazer?" value={descricao} onChangeText={setDescricao} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="E-mail" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} style={{ borderWidth: 1, marginBottom: 10, padding: 10 }} />
      <Button title="Registrar" onPress={registrar} />
    </View>
  );
}
EOF

cat > src/screens/Dashboard.js << 'EOF'
import React from 'react';
import { View, Text } from 'react-native';

export default function Dashboard() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22 }}>Bem-vindo ao Favela Business!</Text>
      <Text>Gestão simples e poderosa para empreendedores locais.</Text>
    </View>
  );
}
EOF

# 8️⃣ Git inicialização e push
git init
git add .
git commit -m "Primeira versão Favela Business"
git branch -M main
git remote add origin https://github.com/Tgsdobigode/favela-business.git
git push -u origin main
