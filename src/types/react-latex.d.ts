declare module 'react-latex-next' {
  import * as React from 'react'
  
  interface LatexProps {
    children: string
    className?: string
  }
  
  export default class Latex extends React.Component<LatexProps> {}
}
