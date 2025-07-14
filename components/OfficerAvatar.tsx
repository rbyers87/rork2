import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';

interface OfficerAvatarProps {
  name: string;
  size?: number;
  image?: string;
  showBadge?: boolean;
  badgeText?: string;
}

export default function OfficerAvatar({ 
  name, 
  size = 40, 
  image, 
  showBadge = false,
  badgeText
}: OfficerAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View 
          style={[
            styles.initialsContainer,
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              backgroundColor: Colors.primary
            }
          ]}
        >
          <Text 
            style={[
              styles.initials,
              { fontSize: size * 0.4 }
            ]}
          >
            {initials}
          </Text>
        </View>
      )}
      
      {showBadge && (
        <View style={[
          styles.badge,
          { 
            width: size * 0.7,
            height: size * 0.7,
            right: -size * 0.2,
            bottom: -size * 0.1,
          }
        ]}>
          <Text style={[
            styles.badgeText,
            { fontSize: size * 0.25 }
          ]}>
            {badgeText || 'ON'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: Colors.border,
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    backgroundColor: Colors.secondary,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
  }
});
