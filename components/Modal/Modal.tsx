import { Close } from '@mui/icons-material'
import { ReactElement } from 'react'

export type ModalProps = {
    show: boolean
	clickClose: () => void
	children: ReactElement<any, any>
}
const Modal = ({ show, clickClose, children } : ModalProps) => {
  return (<>
    {show &&
      <div className="modal">
        <div className="modal-container">
          <button type="button" className="button-close" onClick={clickClose}>
            <Close/>
          </button>
          <section className="modal-main">
            {children}
          </section>
      </div>
    </div>}
  </>)
}
export default Modal