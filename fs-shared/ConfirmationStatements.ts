
export interface ConfirmationStatementItem{
  company_number: string,
  company_name: string,
  company_status: string,
  company_type: string,
  confirmation_statement: {
    last_made_up_to: string,
    next_made_up_to: string,
    next_due: string,
    overdue: boolean
  }
}

export type ConfirmationStatementsData = ConfirmationStatementItem[]
