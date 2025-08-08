import { Metadata } from 'next'
import { PostsListPage } from './posts-list-page'

export const metadata: Metadata = {
	title: '모든 포스트 | My Blog',
	description: '개발과 기술에 대한 모든 포스트를 확인해보세요',
	openGraph: {
		title: '모든 포스트 | My Blog',
		description: '개발과 기술에 대한 모든 포스트를 확인해보세요',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: '모든 포스트 | My Blog',
		description: '개발과 기술에 대한 모든 포스트를 확인해보세요',
	},
}

export default function PostsPage() {
	return <PostsListPage />
}