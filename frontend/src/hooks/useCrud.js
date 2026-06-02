import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

export const useCrud = (endpoint) => {
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const normalize = (body) => {
    if (body?.success) return body
    return { data: body?.data ?? body, meta: body?.meta ?? body }
  }

  const fetchAll = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint, { params })
      const body = normalize(res.data)
      setData(Array.isArray(body.data) ? body.data : body.data?.data || [])
      setMeta(body.meta || null)
      return body
    } catch (e) {
      setError(e.message)
      toast.error('Lỗi tải dữ liệu')
      throw e
    } finally {
      setLoading(false)
    }
  }

  const create = async (payload) => {
    const res = await api.post(endpoint, payload)
    toast.success('Thêm thành công!')
    return normalize(res.data).data
  }

  const update = async (id, payload) => {
    const res = await api.put(`${endpoint}/${id}`, payload)
    toast.success('Cập nhật thành công!')
    return normalize(res.data).data
  }

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`)
    toast.success('Đã xoá!')
  }

  const patch = async (id, payload) => {
    const res = await api.patch(`${endpoint}/${id}`, payload)
    return normalize(res.data).data
  }

  return { data, setData, meta, loading, error, fetchAll, create, update, remove, patch }
}
