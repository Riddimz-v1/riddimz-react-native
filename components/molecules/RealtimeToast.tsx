import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { useNotificationStore, RealtimeNotification } from '@/stores/notifications';

const PRIMARY = Colors.dark.primary;

export function RealtimeToastContainer() {
    const { notifications } = useNotificationStore();

    return (
        <View style={styles.container} pointerEvents="none">
            {notifications.map((n, index) => (
                <ToastItem key={n.id} notification={n} index={index} />
            ))}
        </View>
    );
}

function ToastItem({ notification, index }: { notification: RealtimeNotification, index: number }) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateX = React.useRef(new Animated.Value(-100)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(translateX, {
                toValue: 0,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const getIcon = () => {
        switch (notification.type) {
            case 'join_request': return 'person-add';
            case 'join_approved': return 'checkmark-circle';
            case 'gift': return 'gift';
            case 'performer_added': return 'mic';
            default: return 'notifications';
        }
    };

    const getBgColor = () => {
        switch (notification.type) {
            case 'gift': return '#FFD700'; // Gold
            case 'join_request': return PRIMARY;
            case 'join_approved': return '#4CAF50'; // Green
            default: return 'rgba(255,255,255,0.1)';
        }
    };

    return (
        <Animated.View 
            style={[
                styles.toast, 
                { 
                    opacity, 
                    transform: [{ translateX }],
                    top: 100 + (index * 60)
                }
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: getBgColor() }]}>
                <Ionicons name={getIcon() as any} size={16} color="#fff" />
            </View>
            <ThemedText style={styles.message} numberOfLines={1}>
                {notification.message}
            </ThemedText>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    toast: {
        position: 'absolute',
        left: 20,
        right: 40,
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        maxWidth: 300,
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    message: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    }
});
