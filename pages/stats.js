import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/Stats'), { ssr: false })