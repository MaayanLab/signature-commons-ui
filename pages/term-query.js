import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/TermQuery'), { ssr: false })
