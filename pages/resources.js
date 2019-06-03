import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/Resources'), { ssr: false })
