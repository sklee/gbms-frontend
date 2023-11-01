const Grid = () =>{
    const state ={
        list: [
            {   
                id: 0,
                prdComp: '일진포장',
                process: '초록박스 특대(480*315*230)',
                priceStandard: '개',
                price: 695,
                applyDate: '2022.09.01',
                ref: '',
                workState: '',
            }
        ],
        idx: '',    
        grid:'',
        setGoods: null,
    };

    const initGrid = (grid) => {
        state.grid= grid;

        grid.formatItem.addHandler(function (s, e) {
            
            if (e.panel == s.cells) {
                let item = s.rows[e.row].dataItem;
                let col = s.columns[e.col];
                switch (col.binding) {
                    case 'price':
                        e.cell.innerHTML = '<button class="btnText btnRed">' + item.price + '</button>';
                        break;
                    case 'workState':
                        e.cell.innerHTML = '<button class="btnText blueTxt">추가</button>';
                        break;
                }
            }
        });

        grid.addEventListener(grid.hostElement, 'click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                let item = wjCore.closest(e.target, '.wj-cell')['dataItem'];
                switch (e.target.id) {
                    case 'btnLink':
                        break;
                }
            }
        });
    }

    return(
        <Row className='gridWrap'>
            <FlexGrid
                itemsSource={state.list} 
                initialized={(s) => initGrid(s)}
                headersVisibility="Column"
                autoRowHeights={true}
                style={{minHeight: '300px'}}
            >
                <FlexGridColumn header='제작처' binding='prdComp' width={120} />
                <FlexGridColumn header='공정' binding='process'width="*" minWidth={150} />
                <FlexGridColumn header='단가 기준' binding='priceStandard' width={80} /> 
                <FlexGridColumn header='단가' binding='price' width={80} align="right"/>
                <FlexGridColumn header='단가 적용일' binding='applyDate' width={120} />
                <FlexGridColumn header='참고사항' binding='ref' width={150} />
                <FlexGridColumn header='작업' binding='workState' width={80} align="center"/>
            </FlexGrid>
        </Row>
    );
}