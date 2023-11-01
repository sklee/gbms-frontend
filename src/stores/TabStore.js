import { observable, action } from 'mobx';

class TabStore {
    // 생성자
    constructor() {
        
    }

    // 메뉴바 펼치고 접기 통제 변수
    @observable menuCollapsing = false

    @observable.struct currentTabId = ''

    @observable.struct currentTabName = ''

    @observable addTab = null
    
    @action toggle = () => {
        this.menuCollapsing = !this.menuCollapsing
        setTimeout(() => {
            this.model.doAction( { 
                type: 'resize', 
                id: 'view-area', 
                direction: 'horizontal' 
            })
        }, 250)
    }
}

export default TabStore;