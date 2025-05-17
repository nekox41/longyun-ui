import request from '@/utils/request'

// 查询报告管理列表
export function listReport(query) {
  return request({
    url: '/management/report/list',
    method: 'get',
    params: query
  })
}

// 查询报告管理详细
export function getReport(id) {
  return request({
    url: '/management/report/' + id,
    method: 'get'
  })
}

// 新增报告管理
export function addReport(data) {
  return request({
    url: '/management/report',
    method: 'post',
    data: data
  })
}

// 修改报告管理
export function updateReport(data) {
  return request({
    url: '/management/report',
    method: 'put',
    data: data
  })
}

// 删除报告管理
export function delReport(id) {
  return request({
    url: '/management/report/' + id,
    method: 'delete'
  })
}
