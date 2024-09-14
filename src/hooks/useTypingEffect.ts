import { useState, useEffect } from 'react';

const useTypingEffect = (message: string) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    setText(message[0]);
    setIsTyping(true);

    const intervalId = setInterval(() => {
      if (i < message.length - 1) {
        setText((prev) => prev + message[i]);
        i++;
      } else {
        clearInterval(intervalId);
        setTimeout(() => setIsTyping(false), 1000);
      }
    }, 15);

    return () => {
      clearInterval(intervalId);
    };
  }, [message]);

  return { text, isTyping };
};

export default useTypingEffect;