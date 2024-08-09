import './styles.css';
// import { GetKey, GetIV } from './azurekeyvault.js';

// Define the ChatBotPlugin module  
// Function to load Google Fonts dynamically
function loadGoogleFonts() {
    var link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

// console.log(`Secret key Value: ${GetKey}`);     
// console.log(`Secret IV Value: ${GetIV}`);     


// function to get subscription key from meta (head)
function getSubscriptionKey() {
    var metaTag = document.querySelector('meta[name="subscription-key"]');
    return metaTag ? metaTag.getAttribute('content') : '';
}
// set subscription value 
var subscriptionKey = getSubscriptionKey();
var domainName  = window.location.origin;

// define passing token and its value in header for API
const headers = new Headers({
    'token': subscriptionKey,
    'url': domainName
});
console.log(domainName);

async function encrypt(plainText) {
    const key = new TextEncoder().encode('0123456789abcdef0123456789abcdef'); // 32 bytes for AES-256
    const iv = new TextEncoder().encode('abcdef9876543210'); // 16 bytes for AES-256 IV

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
    );

    // Encode the plain text
    const encodedText = new TextEncoder().encode(plainText);

    // Encrypt the text
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv },
        cryptoKey,
        encodedText
    );

    // Convert the encrypted buffer to base64
    const base64String = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return base64String;
}

// function for the creation of complete chatbot
var ChatBotPlugin = (function () {

    var baseUrl = "https://standalonechatbot.azurewebsites.net/api/standaloneChatbot?param="

    var inputThumbsUpFlag = false;
    var inputThumbsDownFlag = false;
    var isFeedback = false;


    let promptMessage = '';
    let responseMessage = '';
    // Set the maximum number of words allowed
    var maxCharacters = 100;



    //loading flag
    let isloading = false;

    // Retrieve the icon URL from the data attribute
    const iconUrl = document.documentElement.getAttribute('data-icon-url');

    // Retrieve the icon URL from the data attribute
    const chatbotIconUrl = document.documentElement.getAttribute('data-chaticon-url');

    // Retrieve the chatbot header name 
    const chatbotName = document.documentElement.getAttribute('data-header-text');


    // Function to create the chatbot UI
    function createChatBotUI() {
        // Create chatbot container
        var container = document.createElement('div');
        container.classList.add('chatbot-container');
        container.classList.add('arist-Chatbot');

        // Create chatbot icon
        var chatIcon = document.createElement('div');
        chatIcon.classList.add('chatbot-icon');
        container.appendChild(chatIcon);

        // Create SVG element
        // Create an img element for the icon
        var chatIconImg = document.createElement('img');
        chatIconImg.setAttribute('src', chatbotIconUrl);
        chatIconImg.setAttribute('width', '44');
        chatIconImg.setAttribute('height', '39');
        chatIconImg.setAttribute('alt', 'Arist Chat Icon');

        chatIcon.appendChild(chatIconImg);

        // Create chatbot modal
        var chatModal = document.createElement('div');
        chatModal.classList.add('chatbot-modal');
        chatModal.style.display = 'none';

        // Chatbot header
        var header = document.createElement('div');
        header.classList.add('header');

        // Create chatbot logo
        var headerlogo = document.createElement('div');
        headerlogo.classList.add('head-logo');
        var headerText = document.createElement('h3');
        headerText.classList.add('head-text');
        headerText.textContent = chatbotName;
        headerlogo.append(headerText);

        // Create container for SVG
        var svgContainer = document.createElement('div');
        svgContainer.classList.add('svg-container');

        // Create SVG element
        // Create an img element for the icon
        var img = document.createElement('img');
        img.setAttribute('src', iconUrl);
        img.setAttribute('width', '35');
        img.setAttribute('height', '31');
        img.setAttribute('alt', 'Arist Icon');
        headerlogo.append(img);

        // Create container for close button
        var closeButtonContainer = document.createElement('div');
        closeButtonContainer.classList.add('close-button-container');

        // Close button
        var closeButton = document.createElement('span');
        closeButton.classList.add('close-button');
        closeButton.innerHTML = '&times;'; // Close icon
        closeButton.addEventListener('click', function () {
            // Clear chat messages
            chatMessages.innerHTML = '';

            // clear inputArea
            inputArea.innerHTML = '';

            //clear feedback input area
            feedbackInputArea.value= '';

            // Hide the chat modal
            chatModal.style.display = 'none';

            // Display the chat icon
            chatIcon.style.display = 'flex';

            //reset values
            resetValue();

        });


        // Append svg to closeButtonContainer
        closeButtonContainer.appendChild(headerlogo);

        // Append close button to closeButtonContainer
        closeButtonContainer.appendChild(closeButton);

        // Append closeButtonContainer to header
        header.appendChild(closeButtonContainer);

        // Append svgContainer to header
        header.appendChild(svgContainer);

        // Append header to chatModal
        chatModal.appendChild(header);

        // Chat messages container
        var chatMessages = document.createElement('div');
        chatMessages.classList.add('chat-messages');

        // Append chat messages to chat modal
        chatModal.appendChild(chatMessages);

        //loading icon
        var loadingdiv = document.createElement('div');
        loadingdiv.classList.add('loading');
        chatModal.appendChild(loadingdiv);

        // Container for input area and send button
        var inputContainer = document.createElement('div');
        inputContainer.classList.add('input-container');

        // Input area for typing messages
        var inputArea = document.createElement('input');
        inputArea.classList.add('input-area');
        inputArea.setAttribute('type', 'text');
        inputArea.setAttribute('placeholder', 'Please type your question');
        inputContainer.appendChild(inputArea);

        // Send button
        var sendButton = document.createElement('button');
        sendButton.classList.add('send-button');
        sendButton.innerHTML = '&#x27A4;'; // Right arrow emoji


        sendButton.addEventListener('click', function () {
            removefeedbackwindow();
            sendMessage();
            //reset values
            resetValue();

        });

        inputArea.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') { // Check if Enter key is pressed
                if (isFeedback) {
                    // resetFeedback();
                    chatMessages.removeChild(feedbackmodal);
                }
                // Check if promptDiv already exists
                let existingPromptDiv = chatMessages.querySelector('.promptClass');
                if(existingPromptDiv){
                    chatMessages.removeChild(existingPromptDiv);
                }
                removefeedbackwindow();
                sendMessage();
                //reset values
                resetValue();

            }
        });

        // Append sendButton to inputContainer
        inputContainer.appendChild(sendButton);

        // Append inputContainer to chatModal
        chatModal.appendChild(inputContainer);

        // Append chatModal to container
        container.appendChild(chatModal);

        // Append the chatbot container to the body
        document.body.appendChild(container);

        // Event listener to open chat modal
        chatIcon.addEventListener('click', function () {
            if (subscriptionKey) {
                chatModal.style.display = 'block';
                chatIcon.style.display = 'none';
                getPrompt();
            } else {
                console.error('Subscription key is null.');
            }

        });


        // Create an SVG element for thumbsUp
        var thumbsUPElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        // Set attributes for the SVG element
        thumbsUPElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        thumbsUPElement.setAttribute('width', '16');
        thumbsUPElement.setAttribute('height', '15');
        thumbsUPElement.setAttribute('viewBox', '0 0 16 15');
        thumbsUPElement.setAttribute('fill', 'none');
        thumbsUPElement.classList.add('mR', 'thumbs-feeback');
        // Add onclick event listener to thumbsUPElement SVG

        thumbsUPElement.onclick = function () {
            if (!inputThumbsUpFlag) {

                thumbsUPElement.style.stroke = '#adff2f';
                thumbsDownElement.style.stroke = 'none';
                removefeedbackwindow();
            }
            sendFeedback(1, "", promptMessage, responseMessage);
            isFeedback = true;
            inputThumbsUpFlag = true;
            inputThumbsDownFlag = false;

        };
        // Set innerHTML for the SVG element
        thumbsUPElement.innerHTML = `<path d="M12 15H3.75V5.25L9 0L9.9375 0.9375C10.025 1.025 10.0969 1.14375 10.1531 1.29375C10.2094 1.44375 10.2375 1.5875 10.2375 1.725V1.9875L9.4125 5.25H14.25C14.65 5.25 15 5.4 15.3 5.7C15.6 6 15.75 6.35 15.75 6.75V8.25C15.75 8.3375 15.7375 8.43125 15.7125 8.53125C15.6875 8.63125 15.6625 8.725 15.6375 8.8125L13.3875 14.1C13.275 14.35 13.0875 14.5625 12.825 14.7375C12.5625 14.9125 12.2875 15 12 15ZM5.25 13.5H12L14.25 8.25V6.75H7.5L8.5125 2.625L5.25 5.8875V13.5ZM3.75 5.25V6.75H1.5V13.5H3.75V15H0V5.25H3.75Z" fill="#D9D9D9"/>
`;


        // Create an SVG element for thumbsDown
        var thumbsDownElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        // Set attributes for the SVG element
        thumbsDownElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        thumbsDownElement.setAttribute('width', '17');
        thumbsDownElement.setAttribute('height', '15');
        thumbsDownElement.setAttribute('viewBox', '0 0 17 15');
        thumbsDownElement.setAttribute('fill', 'none');
        thumbsDownElement.classList.add('thumbs-feeback');
        // Add onclick event listener to thumbsDownElement SVG
        thumbsDownElement.onclick = function () {
            if (!inputThumbsDownFlag) {
                feedbackInputModal();
                thumbsDownElement.style.stroke = '#ff4500e0';
                thumbsUPElement.style.stroke = 'none';
            }
            isFeedback = true;
            inputThumbsDownFlag = true;
            inputThumbsUpFlag = false;

        };

        // Set innerHTML for the SVG element
        thumbsDownElement.innerHTML = `
    <path d="M4.19556 0H12.4456V9.75L7.19556 15L6.25806 14.0625C6.17056 13.975 6.09868 13.8563 6.04243 13.7063C5.98618 13.5563 5.95806 13.4125 5.95806 13.275V13.0125L6.78306 9.75H1.94556C1.54556 9.75 1.19556 9.6 0.895557 9.3C0.595557 9 0.445557 8.65 0.445557 8.25V6.75C0.445557 6.6625 0.458057 6.56875 0.483057 6.46875C0.508057 6.36875 0.533057 6.275 0.558057 6.1875L2.80806 0.9C2.92056 0.65 3.10806 0.4375 3.37056 0.2625C3.63306 0.0875 3.90806 0 4.19556 0ZM10.9456 1.5H4.19556L1.94556 6.75V8.25H8.69556L7.68306 12.375L10.9456 9.1125V1.5ZM12.4456 9.75V8.25H14.6956V1.5H12.4456V0H16.1956V9.75H12.4456Z" fill="#D9D9D9"/>
`;

        // Now thumbsDownElement contains the desired SVG

        // Create an SVG element for seperator between thumbsUP and thumbsDown
        var dividerElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        // Set attributes for the SVG element
        dividerElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        dividerElement.setAttribute('width', '2');
        dividerElement.setAttribute('height', '20');
        dividerElement.setAttribute('viewBox', '0 0 2 20');
        dividerElement.setAttribute('fill', 'none');
        dividerElement.classList.add('mR');

        // Set innerHTML for the SVG element
        dividerElement.innerHTML = `
            <path d="M1 0V20" stroke="#D9D9D9"/>
        `;
        var feedbackmodal = document.createElement('div');
        feedbackmodal.classList.add('userFeedback');
        // Create a span element
        var feedbackText = document.createElement('span');
        feedbackText.classList.add('feedback-text');
        feedbackText.textContent = "Is this conversation helpful so far?";


        // feedback icon thumpsUp and thumpsDown
        function feedback() {

            feedbackmodal.appendChild(feedbackText);
            feedbackmodal.appendChild(thumbsUPElement);
            feedbackmodal.appendChild(dividerElement);
            feedbackmodal.appendChild(thumbsDownElement);
            chatMessages.appendChild(feedbackmodal);

        }

        // Input area for typing messages
        var feedbackInputArea = document.createElement('textarea');
        feedbackInputArea.classList.add('feedback-input-area');
        feedbackInputArea.setAttribute('type', 'text');
        feedbackInputArea.setAttribute('placeholder', 'Please add feedback');
        var counterDiv = document.createElement('div');        
        var counterSpan = document.createElement('span');
        counterSpan.classList.add('char-counter');

        // Function to update the length display
        function updateLength() {
            counterSpan.textContent = `${feedbackInputArea.value.length}/${maxCharacters}`;
        }

        

        // Add an event listener to handle input events
        feedbackInputArea.addEventListener('input', function () {
            updateLength();
            // Check if the length of the input value exceeds the maximum allowed
            if (feedbackInputArea.value.length >= maxCharacters) {
                // Trim the input value to the maximum allowed length
                feedbackInputArea.value = feedbackInputArea.value.slice(0, maxCharacters-1);
                
            }
            updateFeedbackButtonState();
        });

        // submit button 
        var feebackButtondiv = document.createElement('div');
        feebackButtondiv.classList.add('feebackButtonParentdiv')
        var feebackButton = document.createElement('button');
        feebackButton.classList.add('feedback-button');
        feebackButton.textContent = 'Submit';
       


        // on submit button function
        feebackButton.onclick = function () {
            var feedbackTextvalue = feedbackInputArea.value.trim();
            console.log(feedbackTextvalue);
            sendFeedback(0, feedbackTextvalue, promptMessage, responseMessage);
            removefeedbackwindow();
            //clear feedback input area
            feedbackInputArea.value= '';
        }

        function feedbackInputModal() {
            // crear input box and button if already exist
            if (inputThumbsDownFlag) {
                chatMessages.removeChild(feedbackInputArea);
                chatMessages.removeChild(feebackButtondiv);
            }
            counterDiv.appendChild(counterSpan);
            feebackButtondiv.appendChild(counterDiv);
            feebackButtondiv.appendChild(feebackButton)
            chatMessages.appendChild(feedbackInputArea);
            chatMessages.appendChild(feebackButtondiv);
            // Update feedback button state
            updateFeedbackButtonState();

        }
        function removefeedbackwindow(){
            let existingFeedbackInputArea = chatMessages.querySelector('.feedback-input-area');
            let existingFeedbackparentdiv = chatMessages.querySelector('.feebackButtonParentdiv');
            if(existingFeedbackInputArea && existingFeedbackparentdiv){
                chatMessages.removeChild(existingFeedbackInputArea);
                chatMessages.removeChild(existingFeedbackparentdiv);
            }
        }

        
        function resetValue() {
            inputThumbsUpFlag = false;
            inputThumbsDownFlag = false;
            isFeedback = false;
            thumbsUPElement.style.stroke = 'none';
            thumbsDownElement.style.stroke = 'none';
        }

        // Function to enable or disable feedback button based on the presence of feedbackInputArea
        function updateFeedbackButtonState() {
            if (feedbackInputArea.value!="") {
                feebackButton.style.cursor = 'pointer'; // Enable button if feedbackInputArea is not null
                feebackButton.disabled = false; // Initially disabled
            } else {
                feebackButton.style.cursor = 'not-allowed'; // Disable button if feedbackInputArea is null
                feebackButton.disabled = true; // Initially disabled
            }
        }

        // current date and time 
        function DateTimeResponse() {
            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const day = String(now.getDate()).padStart(2, '0');

            const formattedDateTime = `${year}-${month}-${day}`;
            console.log(formattedDateTime);
            return formattedDateTime;
        }


        // Function to send a message
        function sendMessage() {
            var message = inputArea.value.trim();
            if (message !== '') {
                addMessage('You', message);
                // record Start time 
                var startTime = performance.now();
                console.log(startTime);
                sendMessageToAPI(message).then(() => {
                    // Record end time
                    var endTime = performance.now();
                    console.log(endTime);

                    // Calculate the duration in seconds and round down to the nearest integer
                    var duration = Math.floor((endTime - startTime) / 1000);
                    console.log('API call duration:', duration, 'seconds');

                    logResponseTime(duration, message);
                }).catch(error => {
                    console.error('Error calling API:', error);
                });

                // Reset input area
                inputArea.value = '';

                // Scroll to the bottom of the chat
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        var encrypedTextValue = "";

        // Function to send a message to the API through the proxy
        async function sendMessageToAPI(message) {
            const param = `task=getResponse&query=${encodeURIComponent(message)}`;
            const encryptedText = await encrypt(param);
            const apiUrl = `${baseUrl}${encryptedText}`;
            console.log(apiUrl);

            if (!isloading) {
                loadingdiv.textContent = "Loading...";
                inputArea.disabled = true;
            }

            try {
                const response = await fetch(apiUrl, { headers: headers });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const contentType = response.headers.get("content-type");
                let data;

                if (contentType && contentType.includes("application/json")) {
                    data = await response.json();
                } else {
                    data = await response.text();
                    console.log("Text response:", data);
                }

                // Handle the response from the API
                if (data.message) {
                    addMessage('Bot', data.message);
                    if (data.filepath) {
                        data.filepath.forEach(function (file) {
                            if (file.filename) {
                                addMessage('Reference', file.filename,file.filetoken,true); // Add each filename as a clickable button
                            }
                        });
                    }
                } else {
                    addMessage('Bot', 'Sorry, I did not understand that.');
                }

                promptMessage = message;
                responseMessage = data.message;

            } catch (error) {
                console.error('Error:', error);
                addMessage('Bot', 'An error occurred while processing your request.');
                promptMessage = message;
                responseMessage = null;
                logError(error, promptMessage);
            } finally {
                feedback();
                loadingdiv.textContent = "";
                inputArea.disabled = false;
            }
        }



        // Function to add a message to the chat
        function addMessage(sender, text, token,isButton = false) {
            var message = document.createElement('div');
            message.classList.add('message');

            if (isButton) {
                var button = document.createElement('button');
                button.textContent = text;
                button.classList.add('file-button');
                button.addEventListener('click', function () {
                    
                    const encodedString = encodeURIComponent(token);                    
                    try{
                        const redirectURL = `https://devstandalone-ekdhhsdaa7h8c0af.eastus-01.azurewebsites.net/knowledgebase/document/${encodedString}`;
                        window.open(redirectURL, '_blank');
                    }
                    catch (error) {
                        console.error('Error:', error);
                        addMessage('Bot', 'An error occurred while fetching the file.');
                    }                 

                });
                message.appendChild(button);
            } else {
                var userIconSVG = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="user-Icon" width="27"  height="27" viewBox="0 0 27 27" fill="none">
                                <circle cx="13.5" cy="13.5" r="13.5" fill="black"/>
                                <path d="M17.5762 9.228V10.81H13.5022V13.316H16.6242V14.87H13.5022V19H11.5422V9.228H17.5762Z" fill="white"/>
                            </svg>`;
                var botIconSVG = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="bot-Icon" width="27" height="27" viewBox="0 0 27 27" fill="none">
                    <circle cx="13.5" cy="13.5" r="13.5" fill="#DA291C"/>
                    <path d="M15.8853 8L21.2982 19.7678H19.8054L14.3503 8H15.8853Z" fill="#FFFEFE"/>
                    <path d="M12.9498 8L18.3626 19.7678H16.8692L11.4148 8H12.9498Z" fill="#FFFEFE"/>
                    <path d="M11.4135 8L6 19.7678H7.49337L12.9478 8H11.4135Z" fill="#FFFEFE"/>
                    </svg>`;

                // Check if the sender is the user
                if (sender === 'You') {
                    sender = userIconSVG;
                    message.classList.add('user')
                }
                else {
                    sender = botIconSVG;
                    message.classList.add('arist-Bot')
                }

                message.innerHTML = `<strong>${sender}</strong> ${text}`;
            }



            document.querySelector('.chat-messages').appendChild(message);

        }


        async function sendFeedback(isPositive, feedbackText, promptMessage, responseMessage) {
            var dateresponse = DateTimeResponse();
            console.log(dateresponse);
            const param = `task=feedback`;
            const encryptedText = await encrypt(param);
            encrypedTextValue = encryptedText;
            const feedbackAPI = `${baseUrl}${encrypedTextValue}`; // Api for feedback
            console.log(feedbackAPI);
            const feedbackData = {
                "query": promptMessage,
                "response": responseMessage,
                "isLike": isPositive,
                "comment": feedbackText,
                "date": dateresponse

            };

            try {
                const response = await fetch(feedbackAPI, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(feedbackData)
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }

                const responseData = await response.text();
                console.log("Feedback submitted successfully:", responseData);
            } catch (error) {
                console.error("Failed to submit feedback:", error);
            }
        }

        // responseTime Api integration
        async function logResponseTime(responseTime, query) {
            var datecapture = DateTimeResponse();
            console.log(datecapture);
            const param = `task=responseTime`;
            const encryptedText = await encrypt(param);
            encrypedTextValue = encryptedText;
            const responseTimeAPI = `${baseUrl}${encrypedTextValue}`; // Api for feedback
            console.log(responseTimeAPI);

            const responseBody = {
                "responseTime": responseTime,
                "query": query,
                "date": datecapture
            };

            try {
                const response = await fetch(responseTimeAPI, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(responseBody)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const responseData = await response.text();
                console.log('API response:', responseData);

            } catch (error) {
                console.error('Error logging response time:', error);
            }
        }

        // error capture Api integration
        async function logError(errormessage, query) {
            var datecapture = DateTimeResponse();
            console.log(datecapture);
            const param = `task=error`;
            const encryptedText = await encrypt(param);
            encrypedTextValue = encryptedText;
            const errorLogAPI = `${baseUrl}${encrypedTextValue}`; // Api for feedback
            console.log(errorLogAPI);

            const errorBody = {
                "errorMessage": errormessage,
                "query": query,
                "date": datecapture
            };

            try {
                const response = await fetch(errorLogAPI, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(errorBody)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const responseData = await response.text();
                console.log('API response:', responseData);

            } catch (error) {
                console.error('Error logging response time:', error);
            }
        }

        //API integration for System Prompt's

        async function getPrompt() {
            const apiUrl = 'https://standalonechatbot.azurewebsites.net/api/standaloneChatbot?task=getPrompts';
            console.log(apiUrl);
            if (!isloading) {
                loadingdiv.textContent = "Loading...";
                inputArea.disabled = true;
            }

            try {
                const response = await fetch(apiUrl, { headers: headers });
                console.log(response);

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const contentType = response.headers.get("content-type");
                let data;

                if (contentType && contentType.includes("application/json")) {
                    data = await response.json();
                    console.log('JSON response:', data);
                } else {
                    data = await response.text();
                    console.log("Text response:", data);
                }

                // prompt div creation and button functionality
                const promptDiv = document.createElement('div');
                promptDiv.classList.add('promptClass');
                data.forEach((promptinteration) => {
                    const promptbutton = document.createElement('button');
                    promptbutton.classList.add('prompt-btn');

                    // Set the button's text content to the prompt value
                    promptbutton.textContent = promptinteration;

                    promptbutton.addEventListener('click', () => {
                        console.log(`Button clicked: ${promptinteration}`);
                        chatMessages.removeChild(promptDiv);
                        inputArea.value = promptinteration;
                        sendMessage();
                    });

                    // Append the button to the container element
                    promptDiv.appendChild(promptbutton);
                })
                chatMessages.appendChild(promptDiv);

            } catch (error) {
                console.error('Error:', error);
            }finally {                
                loadingdiv.textContent = "";
                inputArea.disabled = false;
            }
        }


    }

    // Public API
    return {

        createChatBotUI: createChatBotUI,
        getSubscriptionKey: getSubscriptionKey
    };
})();

// Initialize the ChatBotPlugin
document.addEventListener('DOMContentLoaded', function () {
    ChatBotPlugin.createChatBotUI();    
});
loadGoogleFonts();
