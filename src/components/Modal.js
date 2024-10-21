function Modal(props) {
    return (
        <>
            <div className="modal" id={props.id} tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">{props.title}</h1>
                            <button id = 'btnModalClose' type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {props.children}
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal;