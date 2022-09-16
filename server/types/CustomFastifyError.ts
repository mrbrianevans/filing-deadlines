

export interface CustomFastifyError{
  message: string, error: string, statusCode: number
}

export const CustomFastifyErrorSchema = {
  type: 'object',
  properties: {
    statusCode: {type:'number'},
    message: {type:'string'},
    error: {type:'string'}
  }
}
