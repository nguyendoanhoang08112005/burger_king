import { GenericCrudPage, crudPages } from '../../components/admin/GenericCrud'

export default function AdminPostsPage({ postCategories }) {
  return <GenericCrudPage {...crudPages.posts} postCategories={postCategories} />
}
