import 'rc-tree/assets/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Tree, { TreeNode } from 'rc-tree';
import axios from 'axios';




function generateTreeNodes(treeNode) {
  const arr = [];
  const key = treeNode.props.eventKey;
  for (let i = 0; i < 3; i++) {
    arr.push({ name: `leaf ${key}-${i}`, key: `${key}-${i}` });
  }
  return arr;
}



function setLeaf(treeData, curKey, level) {
  const loopLeaf = (data, lev) => {
    const l = lev - 1;
    data.forEach((item) => {
      if ((item.id.length > curKey.length) ? item.id.indexOf(curKey) !== 0 :
        curKey.indexOf(item.id) !== 0) {
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
  const loop = (data) => {
    if (level < 1 || curKey.length - 3 > level * 2) return;
    data.forEach((item) => {
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
  setLeaf(treeData, curKey, level);
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
      var data=[];
      Promise.resolve(axios.get("http://indiabiodiversity.org/taxon/listHierarchy?n_level=-1&expand_taxon=false&expand_all=false&classSystem=265799")).then(function(value) {
             value.data.map((item)=>{
              data=data.concat(item)
            })
});
    setTimeout(() => {
      this.setState({
        treeData: data,
        checkedKeys: ['872'],
      });
    }, 100);
  },
  onSelect(info) {
    console.log('selected', info);
  },
  onCheck(checkedKeys) {

    this.setState({
      checkedKeys,
    });
  },
  onLoadData(treeNode) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const treeData = [...this.state.treeData];
        getNewTreeData(treeData, treeNode.props.eventKey, generateTreeNodes(treeNode), 2);
        this.setState({ treeData });
        resolve();
      }, 500);
    });
  },
  render() {
    const loop = (data) => {

      return data.map((item) => {
        if (item.children) {
          console.log("children",item.children);
          return <TreeNode title={item.text} key={item.id}>{loop(item.children)}</TreeNode>;
        }
        return (
          <TreeNode title={item.text} key={item.id} isLeaf={item.isLeaf}
            disabled={item.key === '0-0-0'} showIcon={false}
          />
        );
      });
    };

    const treeNodes = loop(this.state.treeData);
    return (
      <div>
        <h2>dynamic render</h2>
        <Tree
          onSelect={this.onSelect}
          checkable onCheck={this.onCheck} checkedKeys={this.state.checkedKeys}
          loadData={this.onLoadData}
        >
          {treeNodes}
        </Tree>
      </div>
    );
  },
});
export default Demo;
