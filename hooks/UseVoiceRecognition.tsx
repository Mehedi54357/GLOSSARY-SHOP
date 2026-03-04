import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

let SpeechTranscriber: any = {};
if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
  try {
    SpeechTranscriber = require('expo-speech-transcriber');
  } catch (e) {
    console.log('expo-speech-transcriber not available');
  }
}

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);

  const isExpoGo = Constants.appOwnership === 'expo';
  const canUseVoice = Platform.OS !== 'web' && !isExpoGo && SpeechTranscriber.useRealTimeTranscription;

  const { text, error: transcriptionError, isFinal: final } = canUseVoice
    ? SpeechTranscriber.useRealTimeTranscription?.() ?? { text: '', error: null, isFinal: false }
    : { text: '', error: null, isFinal: false };

  useEffect(() => {
    if (canUseVoice && transcriptionError) {
      setError(transcriptionError);
      setIsListening(false);
    }
  }, [transcriptionError]);

  useEffect(() => {
    if (canUseVoice) {
      setTranscript(text || '');
      setIsFinal(final || false);
    }
  }, [text, final]);

  const requestPermissions = async () => {
    if (!canUseVoice) {
      setError('এক্সপো গো বা ওয়েবে ভয়েস ফিচার কাজ করে না। অনুগ্রহ করে ডেভেলপমেন্ট বিল্ড তৈরি করুন।');
      return false;
    }
    try {
      if (Platform.OS === 'ios') {
        const speechStatus = await SpeechTranscriber.requestPermissions();
        if (speechStatus !== 'authorized') {
          setError('স্পিচ রিকগনিশনের অনুমতি প্রয়োজন');
          return false;
        }
      }
      const micStatus = await SpeechTranscriber.requestMicrophonePermissions();
      if (micStatus !== 'granted') {
        setError('মাইক্রোফোন ব্যবহারের অনুমতি প্রয়োজন');
        return false;
      }
      return true;
    } catch (err) {
      setError('অনুমতি চাওয়ার সময় সমস্যা');
      return false;
    }
  };

  const startListening = async () => {
    if (!canUseVoice) {
      setError('এক্সপো গো বা ওয়েবে ভয়েস ফিচার কাজ করে না।');
      return;
    }
    setError(null);
    setTranscript('');
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // বাংলা ভাষায় স্পিচ রিকগনিশনের জন্য লোকেল সেট করুন
      await SpeechTranscriber.recordRealTimeAndTranscribe({ locale: 'bn-BD' });
      setIsListening(true);
    } catch (err: any) {
      setError(err.message || 'শোনা শুরু করতে সমস্যা');
    }
  };

  const stopListening = () => {
    if (!canUseVoice) return;
    try {
      SpeechTranscriber.stopListening();
      setIsListening(false);
    } catch (err) {
      setError('থামাতে সমস্যা');
    }
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isFinal,
  };
};