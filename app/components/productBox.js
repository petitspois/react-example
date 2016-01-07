import React from 'react';
import _ from '../lib/parts';
import '../css/style.scss';

class CommentForm extends React.Component{

    handleSubmit(e){
        e.preventDefault();
        const author = this.refs.author.getDOMNode().value.trim();
        const body = this.refs.body.getDOMNode().value.trim();
        const form = this.refs.form.getDOMNode();
        this.props.onSubmit({author:author, body:body});
    }

    render(){
        return (
            <form className="comment-form" ref="form" onSubmit={e=>this.handleSubmit(e)}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Input your comment" ref="body" />
                <input type="submit" value="Add Comment"/>
            </form>
        )
    }
}


class CommentList extends React.Component{
    render(){
        var commentsNode = this.props.comments.map((comment)=>{
            return <Comment author={comment.author}>{comment.body}</Comment>
        });
        return (
            <div className="comment-list">
                {commentsNode}
            </div>
        )
    }
}


class Comment extends React.Component{
    render(){
        return (
            <div>
                <div className="comment-body">
                    {this.props.children}
                </div>
                <div className="comment-author">
                    {this.props.author}
                </div>
            </div>
        )
    }
}

class CommentBox extends React.Component {
    constructor(props){
        super(props);
        this.state = {comments: props.comments || []}
    }

    loadDataFromServer(){
        _.ajax({
            url: this.props.url,
            dataType:'json'
        }).then(ret=>{
            this.setState({comments: ret});
        });
    }

    componentDidMount(){
        this.loadDataFromServer();
    }

    newComment(comments){
        const originComments = this.state.comments;
        const newComments = originComments.concat([comments]);
        this.setState({comments: newComments});
        _.ajax({
            url: this.props.url,
            dataType: 'json',
            type:'POST',
            data: newComments
        }).then(ret=>{
            this.setState({comments: ret});
        }, () => {
            setTimeout(()=>{
                this.setState({comments: originComments});
            }, 2000);
        })
    }

    render (){
        return (
            <div className="comment-box">
                <h1>CommentBox!</h1>
                <CommentList comments={this.state.comments}/>
                <CommentForm onSubmit={comments=>this.newComment(comments)}/>
            </div>
        )
    }

}

React.render(
  <CommentBox url="/comments.json"/>,
  document.getElementById('content')
);
