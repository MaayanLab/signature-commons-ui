import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/Values'), { ssr: false })
