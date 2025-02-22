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

const mdParser = new MarkdownIt();

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
	};

	schema = Yup.object().shape({
		title: Yup.string().required('Title is required'),
		content: Yup.string().required('Content is required'),
	});

	toggle = () => {
		this.setState((prevState) => ({
			modal: !prevState.modal,
		}));
	};

	componentDidMount() {
		this.props.getPosts();
	}

	static propTypes = {
		post: PropTypes.object.isRequired,
		isAuthenticated: PropTypes.bool.isRequired,
		getPosts: PropTypes.func.isRequired,
		addPost: PropTypes.func.isRequired,
	};

	render() {
		const { posts, loading } = this.props.post;

		return (
			<div>
				{this.props.location.state !== undefined ? (
					<Alert color="info">
						{this.props.location.state.notification}
					</Alert>
				) : null}
				{this.props.isAuthenticated ? (
					<div className="mb-3">
						<Button color="danger" onClick={this.toggle}>
							Add new post
						</Button>
					</div>
				) : null}
				
				<Modal isOpen={this.state.modal} toggle={this.toggle}>
					<ModalHeader toggle={this.toggle}>Add new post</ModalHeader>
					<Formik
						initialValues={{ title: '', content: '' }}
						validationSchema={this.schema}
						onSubmit={(values, { setSubmitting, resetForm }) => {
							this.props.addPost({
								title: values.title,
								content: values.content,
							});
							resetForm();
							this.toggle();
						}}
					>
						{({ values, setFieldValue, errors, touched, isSubmitting }) => (
							<Form>
								<ModalBody>
									<Row form>
										<Col>
											<FormGroup>
												<Label for="title">Title</Label>
												<Input
													type="text"
													name="title"
													id="title"
													tag={Field}
													invalid={errors.title && touched.title}
												/>
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
													onChange={({ text }) =>
														setFieldValue('content', text)
													}
												/>
												{errors.content && touched.content && (
													<FormFeedback>{errors.content}</FormFeedback>
												)}
											</FormGroup>
										</Col>
									</Row>
								</ModalBody>
								<ModalFooter>
									<Button color="primary" type="submit" disabled={isSubmitting}>
										Add post
									</Button>
									<Button color="secondary" onClick={this.toggle}>
										Cancel
									</Button>
								</ModalFooter>
							</Form>
						)}
					</Formik>
				</Modal>
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
				{loading ? (
					<div className="w-100 d-flex justify-content-center">
						<Spinner
							type="grow"
							color="primary"
							style={{ width: '3rem', height: '3rem' }}
						/>
					</div>
				) : (
					<ListGroup>
						<TransitionGroup className="posts-list">
							{posts.map(({ _id, title, content }) => (
								<CSSTransition
									key={_id}
									timeout={500}
									classNames="fade"
									appear
								>
									<ListGroupItem className="py-4">
										<h3>{title}</h3>
										<div
											dangerouslySetInnerHTML={{
												__html: DOMPurify.sanitize(renderMarkdown(content)), // Sanitize HTML to prevent XSS
											}}
										/>
										<Link to={`/post/${_id}`}>
											<Button color="primary">
												Read post
											</Button>
										</Link>
									</ListGroupItem>
								</CSSTransition>
							))}
						</TransitionGroup>
					</ListGroup>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	post: state.post,
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { getPosts, addPost })(PostsList);
