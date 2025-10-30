import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeToast } from '../store/slices/toastSlice'
import Toast from './Toast'

const ToastContainer = () => {
  const toasts = useSelector(state => state.toast.toasts)
  const dispatch = useDispatch()

  const handleClose = (id) => {
    dispatch(removeToast(id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => handleClose(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}

export default ToastContainer
