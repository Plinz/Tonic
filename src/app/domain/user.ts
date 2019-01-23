interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    favoriteColor?: string;
    fcmTokens?: { [token: string]: true };
}