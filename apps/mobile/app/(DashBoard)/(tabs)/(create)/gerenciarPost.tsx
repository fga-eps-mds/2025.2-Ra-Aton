// ARQUIVO: apps/mobile/app/(DashBoard)/(tabs)/(create)/gerenciarPost.tsx
import React from 'react';
import { View, Text } from 'react-native';
import BackGroundComp from '@/components/BackGroundComp';
import { CardHandlePostComp } from '@/components/CardHandlePostsComp';
// ADICIONE 'export default' aqui
export default function GerenciarPostScreen() {
    return (
        <BackGroundComp>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <CardHandlePostComp>
                    
                </CardHandlePostComp>

            </View>
        </BackGroundComp>
    );
}