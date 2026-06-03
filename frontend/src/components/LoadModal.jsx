import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
    Button
} from 'react-aria-components';

export default function LoadModal() {
    return (
        <DialogTrigger>
            <Button>Открыть</Button>

            <ModalOverlay className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <Modal className="bg-white rounded-xl p-6 w-[500px]">
                    <Dialog>
                        {({ close }) => (
                            <>
                                <h2 className="text-xl font-bold">
                                    Заголовок
                                </h2>

                                <p className="mt-4">
                                    Содержимое модального окна
                                </p>

                                <button
                                    onClick={close}
                                    className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded"
                                >
                                    Закрыть
                                </button>
                            </>
                        )}
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}
