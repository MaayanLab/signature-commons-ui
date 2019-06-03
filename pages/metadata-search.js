import dynamic from 'next/dynamic'
export default dynamic(() => import('../components/MetadataSearch'), { ssr: false })
