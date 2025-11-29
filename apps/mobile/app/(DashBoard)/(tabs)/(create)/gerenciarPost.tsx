// ARQUIVO: apps/mobile/app/(DashBoard)/(tabs)/(create)/gerenciarPost.tsx
import React from 'react';
import { View, Text } from 'react-native';
import BackGroundComp from '@/components/BackGroundComp';

// ADICIONE 'export default' aqui
export default function GerenciarPostScreen() {
    return (
        <BackGroundComp>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>Gerenciar Post</Text>
            </View>
        </BackGroundComp>
    );
}