const uniqueMessage = (error) => {
  let output
  try {
    let fieldName = error.message.substring(
      error.message.lastIndexOf('{') + 2,
      error.message.lastIndexOf(':')
    )
    output =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists'
  } catch (ex) {
    output = 'Unique field already exists'
  }

  return output
}

exports.errorHandler = (error) => {
  let message = ''

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error)
        break
      default:
        message = 'Some thing went wrong'
    }
  } else {
    message = error.message
  }

  return message
}
