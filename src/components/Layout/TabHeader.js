import React from 'react';
import * as FlexLayout from "flexlayout-react";
import { Layout } from 'antd';
import { inject, observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import siteMap from '@pages/menuData';
// Tab을 구성하는 기본값
const config = {
    global: {
        borderSize:0,
        splitterSize:4,
        tabEnableRename:false,
    },
    borders:[],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                id: "view-area",
                weight: 100,
                height: 0,
                enableDeleteWhenEmpty:true,
                active:true
            }
        ]
    }
}

// 각 설정들로 생성한 Tab 
export const model = FlexLayout.Model.fromJson(config)

/** 상단 Tab을 추가하는 함수
 ** thisLocationPathName : 이동할 위치 값 */
export const addTab = (thisLocationPathName) => {
    // 대기중인 Tab 중 현재 location의 Tab이 없으면
    // title과 key로 새 Tab 생성
    // title을 어디서 가져오지
    // menuData에서 가져와야지 뭐

    // NODE 중 존재하는 지 체크

    const getTitleFromLink = (currentLocation) => {
        let title = ''
        let targetMenuData = []
        targetMenuData = siteMap.filter((item) => (currentLocation == item.link))
        if (targetMenuData.length !== 0) {
            title = targetMenuData[0].label
        }
      
        if (targetMenuData[0] && targetMenuData[0].parentId !== undefined) {
          targetMenuData = siteMap.filter((item) => (item.id == targetMenuData[0].parentId))
          if (targetMenuData.length !== 0) {
            title = targetMenuData[0].label + ' > ' + title
          }
        }
      
        if (targetMenuData[0] && targetMenuData[0].parentId !== undefined) {
          targetMenuData = siteMap.filter((item) => (item.id == targetMenuData[0].parentId))
          if (targetMenuData.length !== 0) {
            title = targetMenuData[0].label + ' > ' + title
          }
        }
        return title
    }

    if (thisLocationPathName === "/Login") {
        // 로그인 페이지에 대해서는 아무 행동 X
    }
    else if(model.getNodeById(thisLocationPathName) === undefined) {
        // 없음. 새 NODE 생성
        model.doAction(
            FlexLayout.Actions.addNode(
                {
                    id: thisLocationPathName,
                    type: "tab",
                    name: getTitleFromLink(thisLocationPathName),
                },
                model.getActiveTabset().getId(),
                FlexLayout.DockLocation.CENTER,
                -1
            )
        )
    }
    // 대기 중이던 Tab이면 해당 탭 Active
    else{
        // 재귀하지 않도록
        if (thisLocationPathName !== model.getActiveTabset().getSelectedNode().getId()) {
            model.doAction(FlexLayout.Actions.selectTab(thisLocationPathName))
        }
    }
}

/** 왼쪽 메뉴바를 숨기는 함수
 ** 메뉴바 페이지에서 호출될 예정
 ** thisMenuCollapsing : state값을 전달받아 메뉴를 컨트롤한다. */
export const toggle = (thisMenuCollapsing) => {
    setTimeout(() => {
        model.doAction( { 
            type: 'resize', 
            id: 'view-area', 
            direction: 'horizontal' 
        })
    }, 250)
    return !thisMenuCollapsing
}

const TabHeader = ({renderPage}) => {
    // Tab 추가, 현재 Tab 중 존재하면 해당 Tab active
    // 메뉴바 하단 메뉴바 펼치고 접기

    const history = useHistory()
    return (
        <>
            <FlexLayout.Layout 
                model={model} 
                factory={() => (<></>)}
                onModelChange={(node) => {
                    // onSelect처럼 쓸 수 있을 듯
                    // 활성화된 탭으로 페이지 이동
                    if (node.getActiveTabset().getSelectedNode() !== undefined) {
                        history.push(node.getActiveTabset().getSelectedNode().getId())
                        Cookies.set('viewTabKey', node.getActiveTabset().getSelectedNode().getId(), { expires: 1 } )
                    }
                    else {
                        history.push('/')
                        Cookies.set('viewTabKey', '/', { expires: 1 } )
                    }
                }}
            />
            <Layout className="content">
                {renderPage}
            </Layout>
        </>
    )
    
}

export default TabHeader