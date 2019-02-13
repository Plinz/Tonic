export interface MessageTonic {
    uid?: string;
    sender: string;
    receivers: string[];
    photoURL?: string;
    content: string;
    date: number;
}