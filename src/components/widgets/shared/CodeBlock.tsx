import { HighLighter } from '~/components/ui/code-highlighter'

export const CodeBlock = (props: {
  lang: string | undefined
  content: string
}) => {
  return <HighLighter {...props} />
}

export default CodeBlock
