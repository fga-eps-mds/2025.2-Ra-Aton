// ARQUIVO: apps/mobile/components/PostCardComp.tsx
import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/constants/Theme'
import { Colors } from '@/constants/Colors'
import { IPost } from '@/src/interfaces/Ipost'

// CORREÇÃO: Mudar para 'import default'
import LikeButtonComp from '@/components/LikeButtonComp'
import CommentButtonComp from '@/components/CommentButtonComp'
import ImGoingButtonComp from '@/components/ImGoingButtonComp'
import OptionsButtonComp from '@/components/OptionsButtonComp'
import ProfileThumbnailComp from '@/components/ProfileThumbnailComp'

type PostCardProps = {
  post: IPost
  onCommentPress: () => void
  onDetailsPress: () => void
  onReportPress: () => void
  onLikeToggle: (postId: string, isLiked: boolean) => void
  onAttendToggle: (postId: string, isAttending: boolean) => void
}

export function PostCardComp({
  post,
  onCommentPress,
  onDetailsPress,
  onReportPress,
  onLikeToggle,
  onAttendToggle,
}: PostCardProps) {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? Colors.dark : Colors.light

  const eventDate = post.event?.date ? new Date(post.event.date) : null
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : ''
  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''
  const authorName = post.author?.name || 'Grupo Desconhecido'
  const authorImage = post.author?.profilePicture

  return (
    <View style={[styles.card, { backgroundColor: theme.input }]}>
      <View style={styles.header}>
        <ProfileThumbnailComp
          imageUrl={authorImage}
          style={styles.groupIcon}
        />
        <Text style={[styles.groupName, { color: theme.text }]}>
          {authorName}
        </Text>
        <OptionsButtonComp onPress={onReportPress} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.text, { color: theme.text }]}>{post.content}</Text>
        {post.mediaUrl && (
          <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
        )}
      </View>

      {post.type === 'EVENT' && post.event && (
        <View style={[styles.eventBox, { borderTopColor: theme.gray }]}>
          <View style={styles.eventRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.orange} />
            <Text style={[styles.eventText, { color: theme.text }]}>
              {formattedDate} às {formattedTime}
            </Text>
          </View>
          <View style={styles.eventRow}>
            <Ionicons name="location-outline" size={20} color={theme.orange} />
            <Text style={[styles.eventText, { color: theme.text }]}>
              {post.event.location}
            </Text>
          </View>
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: theme.gray }]}>
        <View style={styles.socialActions}>
          <LikeButtonComp
            isLiked={post.isLiked}
            count={post._count.likes}
            onPress={() => onLikeToggle(post.id, post.isLiked)}
          />
          <CommentButtonComp
            count={post._count.comments}
            onPress={onCommentPress}
          />
        </View>

        {post.type === 'EVENT' && (
          <View style={styles.eventActions}>
            <TouchableOpacity
              onPress={onDetailsPress}
              style={[styles.eventButton, { backgroundColor: theme.gray }]}
            >
              <Text style={[styles.eventButtonText, { color: theme.text }]}>
                Detalhes
              </Text>
            </TouchableOpacity>
            <ImGoingButtonComp
              isAttending={post.isAttending}
              onPress={() => onAttendToggle(post.id, post.isAttending)}
            />
          </View>
        )}
      </View>
    </View>
  )
}

// ... (Estilos permanecem os mesmos)
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 4,
  },
  eventBox: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  socialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eventButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  eventButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
})