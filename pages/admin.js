import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/Admin'), { ssr: false })