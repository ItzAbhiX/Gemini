import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompt, setPrevPrompt] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const delayTypingEffect = (responseArray) => {
        let fullText = "";
        responseArray.forEach((word, index) => {
            setTimeout(() => {
                fullText += word + " "; // Accumulate text
                setResultData(fullText); // Update state with accumulated text
            }, 75 * index); // Delay for each word
        });
    };
    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    }

    const onSent = async (prompt) => {
        setResultData(""); // Clear previous result before typing
        setLoading(true);
        setShowResult(true);
        
        let response;
        
        const finalPrompt = prompt || input;

        if(!finalPrompt){
            setLoading(false);
            return;
        }

        setPrevPrompt(prev=> [...prev,finalPrompt]);
        setRecentPrompt(finalPrompt);

        response = await run(finalPrompt);

        if(typeof response !== 'string'){
            throw new Error("Invalid response format");
        }
        
        let cleanedResponse = response.replace(/#/g, "");
        let responseArray = cleanedResponse.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += "<b>" + responseArray[i] + "</b>";
            }
        }

        let newResponse2 = newResponse.split("*").join("</br>");
        let newResponseArray = newResponse2.split(" ");

        // Trigger the typing effect with the response array
        delayTypingEffect(newResponseArray);

        setLoading(false);
        setInput(""); // Clear input after sending
    };

    const contextValue = {
        prevPrompt,
        setPrevPrompt,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
