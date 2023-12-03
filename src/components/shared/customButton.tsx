import { getContrastingColor } from "../../utility";

const CustomButton = ({
    type,
    title,
    customStyles,
    handleClick,
  }: {
    type: "filled" | "outline";
    title: string;
    customStyles: string;
    handleClick: () => void;
  }) => {
    const generateStyle = (type: string) => {
      if (type === "filled")
        return {
          backgroundColor: getContrastingColor("#efbd48"),
          color: "#efbd48",
        };
      else if (type === "outline")
        return {
          borderWidth: "1px",
          borderColor: "#efbd48",
          color: "#efbd48",
        };
    };
    return (
      <button
        className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
        style={generateStyle(type)}
        onClick={handleClick}
      >
        {title}
      </button>
    );
  };

  export default CustomButton;