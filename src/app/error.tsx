'use client'

import { useEffect } from 'react'

import { NormalContainer } from '~/components/layout/container/Normal'
import { StyledButton } from '~/components/ui/button'

// eslint-disable-next-line react/display-name
export default ({ error, reset }: any) => {
  useEffect(() => {
    console.log('error', error)
    // captureException(error)
  }, [error])

  return (
    <NormalContainer>
      <div className="flex min-h-[calc(100vh-10rem)] flex-col center">
        <h2 className="mb-5">Something went wrong!</h2>
        <StyledButton variant="primary" onClick={reset}>
          Try again
        </StyledButton>
      </div>
    </NormalContainer>
  )
}
