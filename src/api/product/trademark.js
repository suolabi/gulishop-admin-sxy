import request from '@/utils/request'



export default {
    // 我们要一次把增删改查的接口全部写完
    // DELETE /admin/product/baseTrademark/remove/{id}
    // 删除BaseTrademark
    delete(id){
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },
    // POST /admin/product/baseTrademark/save
    // 新增BaseTrademark
    // PUT /admin/product/baseTrademark/update
    // 修改BaseTrademark
    // 增加和修改在一起，增加没id,修改有id
    addOrUpdate(trademark){
        if(trademark.id){
            return request.put('/admin/product/baseTrademark/update',trademark)
        }else{
            return request.post('/admin/product/baseTrademark/save',trademark)
        }
    },

    // GET /admin/product/baseTrademark/{page}/{limit}
    // 分页列表
    getPageList(page,limit){
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    }

}