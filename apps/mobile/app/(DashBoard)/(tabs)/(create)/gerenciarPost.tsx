import React from 'react';
import { View, FlatList, Modal, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import BackGroundComp from '@/components/BackGroundComp';
import AppText from '@/components/AppText';
import { CardHandlePostComp } from '@/components/CardHandlePostsComp';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import CommentsModalComp from '@/components/CommentsModalComp';
import { CustomAlertModalComp } from '@/components/CustomAlertModalComp';

// Importa apenas o hook de lógica
import { useGerenciarPostsLogic } from '@/libs/hooks/useGerenciarPostsLogica';

export default function GerenciarPostScreen() {
    // Destrutura tudo que vem da lógica
    const {
        myPosts,
        selectedPost,
        postComments,
        isLoading,
        isRefreshing,
        menuVisible,
        commentsModalVisible,
        loadingComments,
        alertConfig,
        onRefresh,
        setMenuVisible,
        setCommentsModalVisible,
        closeAlert,
        openActionMenu,
        handleEditPost,
        confirmDeletePost,
        handleOpenManageComments,
        handleDeleteComment
    } = useGerenciarPostsLogic();

    return (
        <BackGroundComp>
            <AppText style={{ textAlign: 'center', fontSize: 24, marginTop: 10, color: Colors.dark.orange }}>
                Gerenciar Meus Posts
            </AppText>
            
            {isLoading ? (
                <ActivityIndicator style={{marginTop: 50}} color={Colors.dark.orange} />
            ) : (
                <FlatList
                    data={myPosts}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={<AppText style={{textAlign: 'center', marginTop: 20}}>Você não tem posts.</AppText>}
                    renderItem={({ item }) => (
                        <CardHandlePostComp 
                            title={item.title}
                            attendancesCount={item.attendancesCount}
                            onOpenMenu={() => openActionMenu(item)}
                            onPressCard={() => handleOpenManageComments(item)}
                        />
                    )}
                />
            )}

            <Modal transparent visible={menuVisible} animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.menuContainer}>
                        <AppText style={styles.menuTitle}>Opções do Post</AppText>
                        
                        <TouchableOpacity style={styles.menuOption} onPress={() => selectedPost && handleEditPost(selectedPost)}>
                            <Ionicons name="pencil" size={20} color={Colors.dark.text} />
                            <AppText style={{color:'white'}}>Editar Post</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuOption} onPress={() => selectedPost && confirmDeletePost(selectedPost.id)}>
                            <Ionicons name="trash" size={20} color="red" />
                            <AppText style={{color: 'red'}}>Deletar Post</AppText>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <CommentsModalComp
                isVisible={commentsModalVisible}
                onClose={() => setCommentsModalVisible(false)}
                comments={postComments}
                isLoading={loadingComments}
                isAuthor={true}
                onDeleteComment={handleDeleteComment}
            />

            <CustomAlertModalComp
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onConfirm={alertConfig.onConfirm}
                type={alertConfig.type}
                onClose={closeAlert}
            />
        </BackGroundComp>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: Colors.dark.input,
        padding: 20,
        borderRadius: 10,
        width: '80%',
        gap: 15,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: Colors.dark.orange
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
});