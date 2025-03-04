
import React, { FC, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SpeechToTextController } from "react-native-executorch";
import LiveAudioStream from "react-native-live-audio-stream";
import SWMIcon from '../assets/swm_icon.svg';
import { options } from "../constants";
import { float32ArrayFromPCMBinaryBuffer, startStreamingAudio } from "../utils";

const SpeechToTextScreen: FC = () => {
  const [transcription, setTranscription] = useState("");
  const sttRef = useRef<SpeechToTextController | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioBuffer = useRef<number[]>([]);

  const onToken = (token: string) => {
    setTranscription((prev) => prev + token);
    return token;
  };

  const onChunk = (data: string) => {
    const float32Chunk = float32ArrayFromPCMBinaryBuffer(data);
    audioBuffer.current?.push(...float32Chunk);
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      LiveAudioStream.stop();
      setIsRecording(false);
      await sttRef.current?.forwardFromWaveform(audioBuffer.current);
      audioBuffer.current = [];
    } else {
      setTranscription("");
      setIsRecording(true);
      startStreamingAudio(options, onChunk);
    }
  };

  useEffect(() => {
    if (!sttRef.current) {
      sttRef.current = new SpeechToTextController({
        onTokenCallback: onToken as any,
      });
    }

    (async () => {
      try {
        await sttRef.current?.loadModel(
          require("../assets/xnnpack_whisper_preprocessor.pte"),
          require("../assets/xnnpack_whisper_encoder_dynamic.pte"),
          require("../assets/xnnpack_whisper_decoder_int32.pte")
        );
        console.log("Model loaded successfully!");
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.topContainer}>
        <SWMIcon />
        <Text style={styles.topContainerText}>
          {'React Native ExecuTorch - Whisper demo'}
        </Text>
      </View>
      <View style={styles.transcriptionContainer}>
        <Text
          style={transcription ? styles.transcriptionText : { ...styles.transcriptionText, color: 'gray' }}
        >
          {transcription || 'Start recording to transcribe audio...'}
        </Text>
      </View>
      <View style={styles.iconsContainer}>
        <View
          style={[
            styles.recordingButtonWrapper,
            isRecording && { borderColor: 'rgb(240, 63, 50)' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.recordingButton,
              isRecording && { backgroundColor: 'rgba(240, 63, 50, 0.8)' },
            ]}
            onPress={handleRecordPress}
          >
            <Text style={styles.recordingButtonText}>
              {isRecording ? "STOP RECORDING" : "START RECORDING"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Keep the same StyleSheet as before
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButtonWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    borderWidth: 3,
    borderColor: '#001A72',
    borderRadius: 50,
  },
  recordingButton: {
    paddingVertical: 20,
    backgroundColor: '#001A72',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 40,
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainerText: {
    fontSize: 16,
    marginTop: 6,
    color: 'black',
    fontWeight: "600",
  },
  transcriptionContainer: {
    flex: 9,
    paddingTop: 20,
    width: '90%',
  },
  transcriptionText: {
    fontSize: 24,
    fontWeight: "600",
  },
  iconsContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
  },
  recordingButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SpeechToTextScreen;
