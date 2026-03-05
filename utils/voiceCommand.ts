export const parseVoiceCommand = (text: string) => {

const command = text.toLowerCase().trim();

if (
command.includes("যোগ") ||
command.includes("jog") ||
command.includes("add")
) {


const words = command.split(" ");

if (words.length >= 2) {

  const name = words[1];

  return {
    action: "ADD_PRODUCT",
    name,
    price: 0,
    quantity: 1
  };

}

}

return null;
};
