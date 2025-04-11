interface Input_parameters {
    type?:string;
    placeholder:string;
    name:string;
    value:string;
    onchange:(e:React.ChangeEvent<HTMLInputElement>) => void;
}
const InputField:React.FC<Input_parameters> = ({type = 'text', placeholder,name,value,onchange}) => {
    return (
        <input type = {type} placeholder = {placeholder} name = {name} value = {value} onChange ={onchange}  className="input-field"
        required />
    );


};

export default InputField ;
