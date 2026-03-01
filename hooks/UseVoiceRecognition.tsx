import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

let SpeechTranscriber: any = {};
// শুধুমাত্র native platform এবং development build এ লাইব্রেরি লোড করব, Expo Go তে না
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

  const isExpoGo = Constants.appOwnership === 'expo';
  const canUseVoice = Platform.OS !== 'web' && !isExpoGo && SpeechTranscriber.useRealTimeTranscription;

  // নেটিভ প্ল্যাটফর্মে এবং development build এ রিয়েল টাইম ট্রান্সক্রিপশন
  const { text, error: transcriptionError } = canUseVoice
    ? SpeechTranscriber.useRealTimeTranscription?.() ?? { text: '', error: null }
    : { text: '', error: null };

  useEffect(() => {
    if (canUseVoice && transcriptionError) {
      setError(transcriptionError);
      setIsListening(false);
    }
  }, [transcriptionError]);

  useEffect(() => {
    if (canUseVoice) {
      setTranscript(text || '');
    }
  }, [text]);

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
      await SpeechTranscriber.recordRealTimeAndTranscribe();
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
  };
};