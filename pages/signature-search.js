import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/SignatureSearch'), { ssr: false })
