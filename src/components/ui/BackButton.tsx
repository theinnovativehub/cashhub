import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
	const navigate = useNavigate();
	return (
		<button
			className='fixed top-4 left-4 rounded-lg flex items-center text-white gap-2 bg-gray-700/50 border border-gray-500 backdrop-blur-sm px-2 py-1'
			onClick={() => navigate(-1)}>
			<FaArrowLeft />
			<span>Go Back</span>
		</button>
	);
}
