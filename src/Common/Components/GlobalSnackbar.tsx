import React from 'react'
import clsx from 'clsx'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import { orange, lightGreen, red, lightBlue } from '@mui/material/colors'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import SnackbarContent from '@mui/material/SnackbarContent'
import WarningIcon from '@mui/icons-material/Warning'
import { makeStyles } from '@mui/material/styles'
import { observable } from 'mobx'
import { useObserver } from 'mobx-react-lite'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
}

const Message = observable({
  message: "",
  open: false,
  type: "info" as keyof typeof variantIcon,
})

const useStyles = makeStyles(theme => ({
  success: { backgroundColor: lightGreen[700], },
  error: { backgroundColor: red[600], },
  info: { backgroundColor: lightBlue[600], },
  warning: { backgroundColor: orange[700], },
  icon: { fontSize: 20, },
  iconVariant: { opacity: 0.9, marginRight: theme.spacing(1), },
  message: { display: 'flex', alignItems: 'center', },
}))

export function userMessage(message: string, type = "info" as keyof typeof variantIcon) {
  Message.message = message
  Message.type = type
  Message.open = true
}

const handleClose = (event: any, reason?: string) => {
  if (reason === 'clickaway') return
  Message.open = false
}

const GlobalSnackbar = () => {

  const cn = useStyles()
  const Icon = variantIcon[Message.type]

  return useObserver(() => (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={Message.open}
      autoHideDuration={5000}
      onClose={handleClose}
      key={Message.message + Message.type}
    >
      <SnackbarContent
        className={cn[Message.type]}
        message={
          <span className={cn.message}>
            <Icon className={clsx(cn.icon, cn.iconVariant)} />
            {Message.message}
          </span>
        }
        action={[
          <IconButton key="close" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon className={cn.icon} />
          </IconButton>,
        ]}
      />
    </Snackbar>))
}

export default GlobalSnackbar