// Modal as a separate component
import { useEffect, useRef } from "react";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export function Dialog({ open, onClose, children }: ModalProps) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (open) {
			ref.current?.showModal();
		} else {
			ref.current?.close();
		}
	}, [open]);

	return (
		<dialog ref={ref} onCancel={onClose}>
			{children}
			<button onClick={onClose}>
				Close
			</button>
		</dialog>
	);
}