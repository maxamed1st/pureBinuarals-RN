import { useRef, useEffect } from 'react';
import { View, Button } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  baseFrequency: number,
  desiredFrequency: number
}

export default function CreateBeat({ baseFrequency, desiredFrequency }: Props) {
  const webViewRef = useRef(null);

  const injectedJs = `
    (function() {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      let leftOscillator;
      let rightOscillator;

      function playBeat(baseFrequency, desiredFrequency) {
        const halfDesiredFrequency = desiredFrequency / 2;

        leftOscillator = ctx.createOscillator();
        leftOscillator.type = "sine";
        leftOscillator.frequency.setValueAtTime(baseFrequency - halfDesiredFrequency, ctx.currentTime);

        rightOscillator = ctx.createOscillator();
        rightOscillator.type = "sine";
        rightOscillator.frequency.setValueAtTime(baseFrequency + halfDesiredFrequency, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(1, ctx.currentTime);

        leftOscillator.connect(gainNode);
        rightOscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
      }

      playBeat(${baseFrequency}, ${desiredFrequency});

      function play() {
        if (leftOscillator && rightOscillator) {
          leftOscillator.start();
          rightOscillator.start();
        }
      }

      function stop() {
        if (leftOscillator && rightOscillator) {
          leftOscillator.stop();
          rightOscillator.stop();
        }
      }

      window.addEventListener("message", (event) => {
        if (event.data === "destroy") {
          ctx.close();
        }
        if (event.data === "play") {
          play();
        } else if (event.data === "stop") {
          stop();
        }
      });
    })();
  `;

  function sendMessage(message: string) {
    webViewRef.current.postMessage(message);
  }

  useEffect(() => {
    return () => {
      sendMessage("destroy");
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        injectedJavaScript={injectedJs}
      />
      <Button title="Play" onPress={() => sendMessage("play")} />
      <Button title="Stop" onPress={() => sendMessage("stop")} />
    </View>
  );
}
