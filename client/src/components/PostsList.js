import React, { Component } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
	Alert,
	Jumbotron,
	ListGroup,
	ListGroupItem,
	Button,
	Spinner,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	FormGroup,
	Label,
	Input,
	Row,
	Col,
	FormFeedback
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getPosts, addPost } from '../actions/postActions';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import DOMPurify from "dompurify"; 
import axios from 'axios';

const mdParser = new MarkdownIt();

const API_URL = process.env.REACT_APP_API_URI + '/api/posts';

export const editPost = (postId, postData) => async (dispatch, getState) => {
    try {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        };
        const res = await axios.put(`${API_URL}/${postId}`, postData, config);
        dispatch({
            type: 'EDIT_POST',
            payload: res.data,
        });
    } catch (err) {
        console.error(err);
    }
};

export const deletePost = (postId) => async (dispatch, getState) => {
    try {
        const token = getState().auth.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        await axios.delete(`${API_URL}/${postId}`, config);
        dispatch({
            type: 'DELETE_POST',
            payload: postId,
        });
    } catch (err) {
        console.error(err);
    }
};

const renderMarkdown = (markdownText) => {
    return markdownText
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>') 
        .replace(/^# (.*$)/gim, '<h1>$1</h1>') 
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>') 
        .replace(/\*(.*?)\*/gim, '<em>$1</em>') 
        .replace(/\n/g, '<br/>');
};

class PostsList extends Component {
    state = {
        modal: false,
        editModal: false,
        currentPost: null,
    };

    schema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        content: Yup.string().required('Content is required'),
    });

    toggle = () => {
        this.setState((prevState) => ({ modal: !prevState.modal }));
    };

    toggleEdit = (post = null) => {
        this.setState({ editModal: !this.state.editModal, currentPost: post });
    };

    componentDidMount() {
        this.props.getPosts();
    }

    handleDelete = (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            this.props.deletePost(postId);
        }
    };

    render() {
        const { posts, loading } = this.props.post;
        const { currentPost } = this.state;

        return (
            <div>
				<Jumbotron>
					<h1 className="display-4">Welcome to KONEKTA Forum!</h1>
					<p className="lead">
						KONEKTA – Connecting Africa Through Knowledge, Innovation, and Technology. 🚀
					</p>
					<hr className="my-2" />
					<p>
						If you haven't done yet, we recommend you to{' '}
						<Link to="/register">register a new account here</Link>.
						<p>Join discussions across Africa! 🌍✨ {`🇺🇬 🇪🇬 🇳🇬 🇿🇦 🇰🇪 🇬🇭 🇪🇹 🇲🇦 🇨🇩 🇹🇳 🇿🇲 🇸🇩 🇸🇳 🇨🇲 🇿🇼 🇲🇿 🇲🇱 🇧🇫 🇲🇬 🇳🇪 🇲🇺 🇧🇼 🇪🇷 🇧🇮 🇱🇸 🇬🇲 🇱🇾 🇹🇬 🇸🇨 🇨🇫 🇹🇩 🇲🇼 🇩🇯`}</p>
					</p>
				</Jumbotron>
                {this.props.isAuthenticated && (
                    <div className="mb-3">
                        <Button color="danger" onClick={this.toggle}>Add new post</Button>
                    </div>
                )}

                {/* Add Post Modal */}
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Add new post</ModalHeader>
                    <Formik
                        initialValues={{ title: '', content: '' }}
                        validationSchema={this.schema}
                        onSubmit={(values, { resetForm }) => {
                            this.props.addPost(values);
                            resetForm();
                            this.toggle();
                        }}
                    >
                        {({ values, setFieldValue, errors, touched }) => (
                            <Form>
                                <ModalBody>
                                    <Row form>
                                        <Col>
                                            <FormGroup>
                                                <Label for="title">Title</Label>
                                                <Input type="text" name="title" id="title" tag={Field} invalid={errors.title && touched.title} />
                                                <FormFeedback>{errors.title}</FormFeedback>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row form>
                                        <Col>
                                            <FormGroup>
                                                <Label for="content">Content</Label>
                                                <MdEditor
                                                    value={values.content}
                                                    style={{ height: '250px' }}
                                                    renderHTML={(text) => mdParser.render(text)}
                                                    onChange={({ text }) => setFieldValue('content', text)}
                                                />
                                                {errors.content && touched.content && <FormFeedback>{errors.content}</FormFeedback>}
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" type="submit">Add post</Button>
                                    <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                                </ModalFooter>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                {/* Edit Post Modal */}
                {currentPost && (
                    <Modal isOpen={this.state.editModal} toggle={() => this.toggleEdit()}>
                        <ModalHeader toggle={() => this.toggleEdit()}>Edit Post</ModalHeader>
                        <Formik
                            initialValues={{ title: currentPost.title, content: currentPost.content }}
                            validationSchema={this.schema}
                            onSubmit={(values) => {
                                this.props.editPost(currentPost._id, values);
                                this.toggleEdit();
                            }}
                        >
                            {({ values, setFieldValue, errors, touched }) => (
                                <Form>
                                    <ModalBody>
                                        <Row form>
                                            <Col>
                                                <FormGroup>
                                                    <Label for="title">Title</Label>
                                                    <Input type="text" name="title" id="title" tag={Field} invalid={errors.title && touched.title} />
                                                    <FormFeedback>{errors.title}</FormFeedback>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row form>
                                            <Col>
                                                <FormGroup>
                                                    <Label for="content">Content</Label>
                                                    <MdEditor
                                                        value={values.content}
                                                        style={{ height: '250px' }}
                                                        renderHTML={(text) => mdParser.render(text)}
                                                        onChange={({ text }) => setFieldValue('content', text)}
                                                    />
                                                    {errors.content && touched.content && <FormFeedback>{errors.content}</FormFeedback>}
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" type="submit">Save changes</Button>
                                        <Button color="secondary" onClick={() => this.toggleEdit()}>Cancel</Button>
                                    </ModalFooter>
                                </Form>
                            )}
                        </Formik>
                    </Modal>
                )}

                <ListGroup>
                    <TransitionGroup className="posts-list">
                        {posts.map(({ _id, title, content, postedBy }) => (
                            <CSSTransition key={_id} timeout={500} classNames="fade" appear>
                                <ListGroupItem className="py-4">
                                    <h3>{title}</h3>
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mdParser.render(content)) }} />
                                    <Button color="warning" onClick={() => this.toggleEdit({ _id, title, content })}>Edit</Button>
                                    <Button color="danger" onClick={() => this.handleDelete(_id)}>Delete</Button>
                                    <Link to={`/post/${_id}`}>
                                        <Button color="primary">Read post</Button>
                                    </Link>
                                </ListGroupItem>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </ListGroup>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
	post: state.post,
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { getPosts, addPost })(PostsList);
