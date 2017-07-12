import 'rc-tree/assets/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import Tree, { TreeNode } from 'rc-tree';

function generateTreeNodes(treeNode) {
  const arr = [];
  const key = treeNode.props.eventKey;
  $.ajax({
   url:"http://indiabiodiversity.org/taxon/listHierarchy",
   data:{
      classSystem:265799,
      id:key
   },
   success:(data)=>{
     data.map((item)=>{
         arr.push({ text:item.text, id: item.id });
     })
 }
})
  return arr;
}

function setLeaf(treeData, curKey, level) {
  const loopLeaf = (data, lev) => {
    const l = lev - 1;
    data.forEach((item) => {
      if ((item.key.length > curKey.length) ? item.key.indexOf(curKey) !== 0 :
        curKey.indexOf(item.key) !== 0) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children, l);
      } else if (l < 1) {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData, level + 1);
}


function getNewTreeData(treeData, curKey, child, level) {

  //console.log("treeData",treeData,"curKey",curKey,"child",child,"level",level);

  const loop = (data) => {
  //  if (level < 1 || curKey.length - 3 > level * 2) return;
    data.forEach((item) => {
    //  console.log(data)
      if (curKey.indexOf(item.id) === 0) {
        if (item.children) {
          loop(item.children);
        } else {
          item.children = child;
        }
      }
    });
  };

  loop(treeData);
  //setLeaf(treeData, curKey, level);
}

const Demo = React.createClass({
  propTypes: {},
  getInitialState() {
    return {
      treeData: [],
      checkedKeys: [],
    };
  },
  componentDidMount() {

    setTimeout(() => {
      $.ajax({
       url:"http://indiabiodiversity.org/taxon/listHierarchy?classSystem=265799",
       success:(data)=>{

         this.setState({
           treeData:data,
           checkedKeys: ['0-0'],
         })
     }
   })
 }, 100);
  },
  onSelect(info) {
    console.log('selected',info);
  },
  onCheck(checkedKeys) {
    console.log("check");
    this.setState({
      checkedKeys,
    });
  },
  onLoadData(treeNode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const treeData = [...this.state.treeData];
        getNewTreeData(treeData, treeNode.props.eventKey, generateTreeNodes(treeNode),10);

          this.setState({
            treeData
          })
        resolve();
      }, 1500);
    });
  },
  render() {
    const loop = (data) => {
      return data.map((item) => {
        if (item.children) {
          return  <TreeNode title={item.text} key={item.id}>{loop(item.children)}</TreeNode>;
        }
        return (
          <TreeNode title={item.text} key={item.id}  />
        );
      });
    };
    const treeNodes = loop(this.state.treeData);
    return (
        <div className="pre-scrollable">
        <h2>Taxon Browser</h2>
        <Tree
          onSelect={this.onSelect}
          checkable onCheck={this.onCheck} checkedKeys={this.state.checkedKeys}
          loadData={this.onLoadData}
        >
            {treeNodes}
        </Tree>

      </div>
    );
  }
});
export default Demo;
